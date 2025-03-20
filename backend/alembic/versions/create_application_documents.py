"""create application documents table

Revision ID: create_application_documents
Revises: 
Create Date: 2024-03-14

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'create_application_documents'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Create enum type for document types
    op.execute("""
        CREATE TYPE document_type AS ENUM (
            'resume',
            'essay',
            'transcript',
            'recommendation_letter',
            'other'
        );
    """)
    
    # Create the application_documents table
    op.create_table(
        'application_documents',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('application_id', sa.UUID(), nullable=False),
        sa.Column('document_type', sa.Enum('resume', 'essay', 'transcript', 'recommendation_letter', 'other', name='document_type'), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('word_count', sa.Integer(), nullable=True),
        sa.Column('original_filename', sa.String(), nullable=True),
        sa.Column('mime_type', sa.String(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['application_id'], ['applications.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Add indexes
    op.create_index('idx_application_documents_application_id', 'application_documents', ['application_id'])
    op.create_index('idx_application_documents_document_type', 'application_documents', ['document_type'])

def downgrade() -> None:
    op.drop_index('idx_application_documents_document_type')
    op.drop_index('idx_application_documents_application_id')
    op.drop_table('application_documents')
    op.execute('DROP TYPE document_type;') 