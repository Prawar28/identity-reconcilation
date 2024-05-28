import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid

# enter prod url
database_url = 'postgres://postgres:prawar1128@localhost:5432/contact_center'

engine = create_engine(database_url)
Session = sessionmaker(bind=engine)

session = Session()
# csv_file_path = '/Users/prawarnarang/Downloads/test_sheet_4 - Sheet1 (1).csv'
# df = pd.read_csv(csv_file_path)
arr =[[]]
columns = ['user_id', 'transaction_id', 'merchant_id', 'amount', 'note', 'merchant_name', 'transaction_date', 'refund_date']

data = np.array(arr)
df = pd.DataFrame(data=data, columns=columns)
df['id'] = [str(uuid.uuid4()) for _ in range(len(df))]

current_time = datetime.now()
date_format = "%d-%b-%Y"

df['transaction_date'] = df['transaction_date'].apply(lambda x: datetime.strptime(x, date_format) if x is not None else None)
df['refund_date'] = df['refund_date'].apply(lambda x: datetime.strptime(x, date_format) if x is not None else None)
df['created_at'] = current_time
df['updated_at'] = current_time

df.to_sql('user_notes', engine, if_exists='append', index=False)
session.close()