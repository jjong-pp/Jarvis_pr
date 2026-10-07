"""Isolated, deterministic portfolio data. No production DB access."""
import os
from pathlib import Path
from datetime import date, datetime, timedelta

ROOT = Path(__file__).resolve().parent
DB = ROOT / 'data' / 'portfolio_sample.db'
os.environ['SCM_DB_PATH'] = str(DB)
os.environ['SCM_BACKUP_DIR'] = str(ROOT / 'data' / 'backups')
from app.database import init_db, SessionLocal, DB_PATH
from app.models import ProductDB, WarehouseDB, InventorySnapshot, SalesHistory, OutflowHistory, InboundDB, MonthlyOrderPlan, UserAccount
from app.core.auth import get_password_hash

assert Path(DB_PATH).resolve() == DB
assert not DB.exists(), 'Do not overwrite an existing demo database'
init_db()
today = date(2026, 10, 8)
stamp = '2026-10-08 09:00:00'
db = SessionLocal()
products = []
for i, label in enumerate(['영양식 A 800g', '영양식 B 800g', '영양식 C 800g', '영양식 D 800g', '영양식 E 400g', '영양식 F 400g'], 1):
    p = ProductDB(product_code=f'DEMO-{i:03}', product_name=f'샘플 {label}', brand_category='FOOD', pack_qty_per_tu=12, currency_unit='USD', purchase_price=5 + i)
    db.add(p)
    products.append(p)
warehouses = [WarehouseDB(warehouse_name=name, warehouse_type=kind, allowed_expiry_days=days, moq=120) for name, kind, days in [('샘플 중앙창고', 'OFFLINE', 180), ('샘플 온라인창고', 'ONLINE', 90), ('샘플 오프라인창고', 'OFFLINE', 120)]]
db.add_all(warehouses)
db.add(UserAccount(username='portfolio', password_hash=get_password_hash('PortfolioSample26!'), role='ADMIN', name='샘플 사용자'))
db.commit()
for pi, p in enumerate(products):
    for wi, w in enumerate(warehouses):
        qty = [4800, 1800, 1200][wi] + pi * 240
        expiry = today + timedelta(days=[75, 210, 390][(pi+wi)%3])
        db.add(InventorySnapshot(snapshot_date=today.isoformat(), warehouse_id=w.id, warehouse_name=w.warehouse_name, product_name=p.product_name, product_code=p.product_code, expiry_date=expiry.isoformat(), qty_cans=qty, updated_at=stamp))
        for week in range(16):
            sold = max(24, 150 + pi*48 - wi*36 + (week%4)*12)
            outflow = sold + [12, 24, 36][week%3]
            day = (today - timedelta(days=7*week)).isoformat()
            db.add(SalesHistory(warehouse_id=w.id, product_id=p.id, base_date=day, sales_qty=sold, created_at=stamp))
            db.add(OutflowHistory(warehouse_id=w.id, product_id=p.id, base_date=day, beginning_inventory=qty+outflow, ending_inventory=qty, simple_outflow_qty=outflow, outflow_type='SALES'))
        db.add(InboundDB(invoice_no=f'DEMO-INV-{pi+1}-{wi+1}', bl_no=f'DEMO-BL-{pi+1}-{wi+1}', purchase_code=f'DEMO-PO-{pi+1}', product_code=p.product_code, arrival_wh_id=w.id, eta=(today+timedelta(days=14+wi*14)).isoformat(), shipping_date=(today-timedelta(days=10)).isoformat(), expiry_date=expiry.isoformat(), manufacture_date=(today-timedelta(days=180)).isoformat(), carton_qty=240, can_qty=2880, unit_price=p.purchase_price, total_price=2880*p.purchase_price, exchange_rate=1300, payment_amount_krw=int(2880*p.purchase_price*1300), payment_date=(today-timedelta(days=12)).isoformat(), status='해상운송중' if wi else '입고완료', created_at=stamp))
    for month, arrival, qty in [('2026-08', '2027-02', 7200), ('2026-09', '2027-03', 8400), ('2026-10', '2027-04', 9600)]:
        db.add(MonthlyOrderPlan(target_month=month, arrival_month=arrival, product_id=p.id, system_suggested_qty=qty+pi*240, user_modified_qty=qty+pi*360, version=1, updated_at=stamp))
db.commit()
print(f'Created isolated synthetic demo: {len(products)} products / {len(warehouses)} warehouses / 18 inventory lots')
print(DB)
db.close()
