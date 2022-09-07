from fastapi import APIRouter, Depends, HTTPException, status
from http.client import NOT_FOUND
from sqlalchemy.orm import Session
from oauth2 import get_current_user
import schemas, models
from database import get_db

router = APIRouter()

@router.post('/hall', tags=['Hall'])
def create_hall(request: schemas.HallBase, db: Session = Depends(get_db)):
    new_hall = models.Hall(hall_name = request.hall_name, seats = request.seats, cost = request.cost, booked = request.booked)
    db.add(new_hall)
    db.commit()
    db.refresh(new_hall)
    return new_hall

@router.get('/hall', tags=['Hall'])
def get_hall(db: Session = Depends(get_db)):
    halls = db.query(models.Hall).all()
    return halls

@router.delete('/hall/{id}', tags=['Hall'])
def get_hall(id: int, db: Session = Depends(get_db)):
    hall = db.query(models.Hall).filter(models.Hall.id == id).first()
    if not hall:
        raise HTTPException(status_code=NOT_FOUND, detail="Not Found")
    db.delete(hall)
    db.commit()
    return 'Hall Deleted'

@router.post('/reservations-hall', tags=['Reservations'])
def book(request: schemas.HallBookingsBase, db: Session = Depends(get_db)):
    booking = models.HallBooking(hall_id = request.hall_id, guest_id = request.guest_id,
                             checkin_date = request.checkin_date, checkout_date = request.checkout_date,
                             total_price = request.total_price, payment_status = request.payment_status)
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking