from contextlib import contextmanager
from app.core.supabase import supabase_client

@contextmanager
def get_db():
    """
    Dependency for getting database context.
    This is kept for compatibility with existing code that uses the get_db dependency.
    """
    try:
        yield supabase_client
    finally:
        # No need to close anything with Supabase REST API
        pass 