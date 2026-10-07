import os
from pathlib import Path
ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)
os.environ['SCM_DB_PATH'] = str(ROOT / 'data' / 'portfolio_sample.db')
os.environ['SCM_BACKUP_DIR'] = str(ROOT / 'data' / 'backups')
import uvicorn
if __name__ == '__main__':
    uvicorn.run('app.main:app', host='127.0.0.1', port=8765)
