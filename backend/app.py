from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pymysql
from datetime import datetime, timedelta
from hashlib import sha256

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

config = {
    'user': 'root',
    'password': '',
    'host': 'localhost',
    'database': 'onlineretaildata',
    'charset': 'utf8mb4',
}

cache = {}
cache_expiration = timedelta(minutes=5)
LIMIT = 50

def get_connection():
    return pymysql.connect(**config, cursorclass=pymysql.cursors.DictCursor)

def execute_query(query, params):
    try:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(query, params)
                return cursor.fetchall()
    except pymysql.MySQLError as e:
        print(f"Error: {e}")
        return None

def generate_cache_key(url, params):
    param_str = '&'.join(f"{key}={value}" for key, value in sorted(params.items()))
    key = f"{url}?{param_str}"
    return sha256(key.encode()).hexdigest()

def get_cached_response(key):
    current_time = datetime.now()
    
    if key in cache:
        cached_response, timestamp = cache[key]
        if current_time - timestamp < cache_expiration:
            return cached_response
        else:
            # Remove expired cache entry
            del cache[key]
    
    return None

def cache_response(key, response):
    cache[key] = (response, datetime.now())

def table_header_mapping():
    return [
        {
            "name":"Order date",
            "id":"order_date",
            "sort": True,
            "sort_by": "desc"
        },
        {
            "name":"Customer",
            "id":"customer",
            "sort": False,
            "sort_by": "desc"
        },
        {
            "name":"City",
            "id":"city",
            "sort": False,
            "sort_by": "desc"
        },
        {
            "name":"State",
            "id":"state",
            "sort": False,
            "sort_by": "desc"
        },
        {
            "name":"Category",
            "id":"category",
            "sort": False,
            "sort_by": "desc"
        },
        {
            "name":"Product",
            "id":"product",
            "sort": False,
            "sort_by": "desc"
        },
        {
            "name":"Quantity",
            "id":"quantity",
            "sort": True,
            "sort_by": "desc"
        },
        {
            "name":"Price",
            "id":"price",
            "sort": True,
            "sort_by": "desc"
        },
        {
            "name":"Total Amount",
            "id":"total_amount",
            "sort": True,
            "sort_by": "desc"
        }
    ]

def stateData(groupByData,pageno):
    try:
        skip = (int(pageno) - 1) * int(LIMIT)
        query = f'''SELECT {groupByData}, SUM(quantity) AS quantity, SUM(total_amount) AS total_amount
                FROM (
                    SELECT {groupByData}, quantity, total_amount
                    FROM vw_analytics
                    LIMIT %s OFFSET %s
                ) AS limited_data
                GROUP BY {groupByData}'''
        return execute_query(query, [LIMIT, skip])

    except Exception as e:
        print(f"An unexpected error occurred: {e}")

def graphData(pageno):
    try:
        skip = (int(pageno) - 1) * int(LIMIT)
        query = f'''SELECT order_date, SUM(quantity) AS quantity, SUM(total_amount) AS total_amount
                FROM vw_analytics GROUP BY order_date'''
        return execute_query(query, [])

    except Exception as e:
        print(f"An unexpected error occurred: {e}")

def getFullCount():
    try:
        query = f'''select COUNT(*) AS full_count FROM vw_analytics'''
        return execute_query(query, [])

    except Exception as e:
        print(f"An unexpected error occurred: {e}")

def analyticApi(pageno,sort,sort_type):
    try:
        limit = 50
        skip = (int(pageno) - 1) * int(limit)
        query = f'''select category_name,city,id,DATE_FORMAT(order_date, '%%d-%%m-%%Y') AS formatted_order_date,product_name,quantity,state,total_amount,user_name,price FROM vw_analytics ORDER BY {sort} {sort_type} LIMIT %s OFFSET %s'''
        return execute_query(query, [LIMIT, skip])

    except Exception as e:
        print(f"An unexpected error occurred: {e}")


@app.get("/analytics")
async def read_items(pageno,sort,sort_type):
    params = {
        "pageno":pageno
    }
    cache_key = generate_cache_key("/analytics", params)
    cached_response = get_cached_response("/")
    if cached_response:
        print("Returning cached response")
        return {"status": 200,"data":cached_response["data"],"graph":cached_response["graph"],"state":cached_response["state"],"full_count":cached_response["full_count"],"table_header":table_header_mapping()}
    response = analyticApi(pageno,sort,sort_type)
    stateResponse = stateData("state",pageno)
    graphResponse = graphData(pageno)

    fullCountRespnse = int(getFullCount()[0]["full_count"] / 50)
    cache_response(cache_key, {"data":response,"state":stateResponse,"graph":graphResponse,"full_count":fullCountRespnse})
    return {"status": 200,"data":response,"table_header":table_header_mapping(),"state":stateResponse,"graph":graphResponse,"full_count":fullCountRespnse}