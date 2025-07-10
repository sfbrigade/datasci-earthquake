import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# enable script to see backend module
repo_root = Path(__file__).parent.parent
os.chdir(repo_root)
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))
    
from backend.database.session import get_db
from backend.api.models.export_metadata import ExportMetadata

def format_time_ago(past_time):
    """Format datetime as 'X hours ago', 'Y days ago', etc."""
    now = datetime.now(timezone.utc)
    
    # Ensure past_time is timezone-aware
    if past_time.tzinfo is None:
        past_time = past_time.replace(tzinfo=timezone.utc)
    
    diff = now - past_time
    
    total_seconds = int(diff.total_seconds())
    
    if total_seconds < 60:
        return f"{total_seconds} seconds ago"
    elif total_seconds < 3600:
        minutes = total_seconds // 60
        return f"{minutes} minutes ago"
    elif total_seconds < 86400:
        hours = total_seconds // 3600
        return f"{hours} hours ago"
    elif total_seconds < 604800:  # 7 days
        days = total_seconds // 86400
        return f"{days} days ago"
    elif total_seconds < 2592000:  # 30 days
        weeks = total_seconds // 604800
        return f"{weeks} weeks ago"
    else:
        months = total_seconds // 2592000
        return f"{months} months ago"

def get_metadata_table():
    """Query export metadata and return formatted markdown table"""
    
    with next(get_db()) as session:
        records = session.query(ExportMetadata).order_by(
            ExportMetadata.last_exported_at.desc()
        ).all()
        
        if not records:
            return "No export metadata found"
            
        # Create simple list format
        lines = ["### Dataset Export Status:"]
        lines.append("")
        
        for record in records:
            time_ago = format_time_ago(record.last_exported_at)
            lines.append(f"- `{record.dataset_name}` last exported `{time_ago}`")
            
        return "\n".join(lines)

if __name__ == "__main__":
    # Set environment like your run_etl script
    os.environ['ENVIRONMENT'] = 'dev'
    print(get_metadata_table())