# frozen_string_literal: true

class InvoiceEquityCalculator
  # If you make changes here, update the tRPC route equityCalculations in frontend/trpc/routes/equityCalculations.ts
  def initialize(company_worker:, company:, service_amount_cents:, invoice_year:)
    @company_worker = company_worker
    @company = company
    @service_amount_cents = service_amount_cents
    @invoice_year = invoice_year
  end

  def calculate
    unvested_grant = company_worker.unique_unvested_equity_grant_for_year(invoice_year)
    share_price_usd = unvested_grant&.share_price_usd || company.fmv_per_share_in_usd
    if company_worker.equity_percentage.nonzero? && share_price_usd.nil?
      Bugsnag.notify("InvoiceEquityCalculator: Error determining share price for CompanyWorker #{company_worker.id}")
      return
    end
    equity_percentage = company_worker.equity_percentage
    equity_amount_in_cents = ((service_amount_cents * equity_percentage) / 100.to_d).round
    equity_amount_in_options =
      if equity_percentage.zero? || !company.equity_enabled?
        0
      else
        (equity_amount_in_cents / (share_price_usd * 100.to_d)).round
      end
    # Handle legitimate zero cases first (these should return zeros, not errors)
    if equity_percentage.zero? || !company.equity_enabled?
      equity_percentage = 0
      equity_amount_in_cents = 0
      equity_amount_in_options = 0
    # Error cases: when equity is expected but something is wrong
    elsif equity_percentage.nonzero? && company.equity_enabled? && equity_amount_in_options <= 0
      Bugsnag.notify("InvoiceEquityCalculator: Calculated equity amount rounds to zero shares for CompanyWorker #{company_worker.id}. Company needs to create proper equity grant.")
      return
    elsif equity_percentage.nonzero? && company.equity_enabled? && (!unvested_grant.present? || unvested_grant.unvested_shares < equity_amount_in_options)
      Bugsnag.notify("InvoiceEquityCalculator: Insufficient unvested shares for CompanyWorker #{company_worker.id}. Company needs to create proper equity grant.")
      return
    end

    {
      equity_cents: equity_amount_in_cents,
      equity_options: equity_amount_in_options,
      equity_percentage:,
    }
  end

  private
    attr_reader :company_worker, :company, :service_amount_cents, :invoice_year
end
