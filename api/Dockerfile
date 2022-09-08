FROM python:3.10.6-slim-buster

WORKDIR /app

COPY ./requirements.txt /app/

RUN pip install -r requirements.txt
RUN pip install python-multipart
COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
