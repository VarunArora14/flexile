# frozen_string_literal: true

class DropTaxDocumentsTable < ActiveRecord::Migration[8.0]
  def up
    # Remove any stray ActiveStorage attachment rows
    execute <<~SQL
      DELETE FROM active_storage_attachments
      WHERE record_type = 'TaxDocument';
    SQL

    # Drop the table and the enum type if they still exist
    drop_table :tax_documents, if_exists: true
    execute "DROP TYPE IF EXISTS tax_documents_status;"
  end

  def down
    raise ActiveRecord::IrreversibleMigration, "tax_documents table has been permanently removed"
  end
end
