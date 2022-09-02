from fastapi import APIRouter, Depends, HTTPException, status
from http.client import NOT_FOUND
from sqlalchemy.orm import Session
from oauth2 import get_current_user
import schemas, models
from database import get_db
from typing import List

router = APIRouter()

@router.post('/room-type', tags=['Room Type'])
def room_type(request: schemas.RoomTypeBase, db: Session = Depends(get_db)):
    new_rt = models.RoomType(room_type = request.room_type, description = request.description, cost = request.cost)
    db.add(new_rt)
    db.commit()
    db.refresh(new_rt)
    return new_rt

# get roomtypes from database
@router.get('/room-type', tags=['Room Type'])
def get_roomtypes(db: Session = Depends(get_db)):
    room_types = db.query(models.RoomType).all()
    return room_types

@router.put('/room-type/{id}', tags=['Room Type'])
def update_room_type(id: int, request: schemas.RoomTypeBase, db: Session = Depends(get_db)):
    room_type = db.query(models.RoomType).filter(models.RoomType.id == id).update({'room_type': request.room_type, 'description': request.description, 'cost': request.cost})
    if not room_type:
        raise HTTPException(status_code=NOT_FOUND, detail="Not Found")
    db.commit()
    return 'updated'

@router.delete('/room-type/{id}', tags=['Room Type'])
def remove_roomtype(id: int, db: Session = Depends(get_db)):
    room_type = db.query(models.RoomType).filter(models.RoomType.id == id).first()
    if not room_type:
        raise HTTPException(status_code=NOT_FOUND, detail="Not Found")
    db.delete(room_type)
    db.commit()
    return 'done'
  
@router.post('/room', tags=['Room'])
async def room(request: schemas.RoomBase, db: Session = Depends(get_db)):
    new_room = models.Room(room_name = request.room_name, room_typeid = request.room_typeid, available = request.available)
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

@router.get('/room', response_model=List[schemas.ListRoom], tags=['Room'])
def get_rooms(db: Session = Depends(get_db)):
    rooms = db.query(models.Room).all()
    return rooms


@router.delete('/room/{id}', tags=['Room'])
def remove_room(id: int, db: Session = Depends(get_db)):
    room = db.query(models.Room).filter(models.Room.id == id).first()
    if not room_type:
        raise HTTPException(status_code=NOT_FOUND, detail="Not Found")
    db.delete(room)
    db.commit()
    return 'done'

@router.patch('/room/{id}', tags=['Room'])
def update_room(id: int, db: Session = Depends(get_db)):
    room = db.query(models.Room).filter(models.Room.id == id).first()
    if not room_type:
        raise HTTPException(status_code=NOT_FOUND, detail="Not Found")
    db.update()
    db.commit()
    return 'done'

@router.post('/guest', tags=['Guest'])
def register_guest(request: schemas.GuestBase, db: Session = Depends(get_db)):
    new_guest = models.Guest(name = request.name, address = request.address, phone_no = request.phone_no)
    existing_guest = db.query(models.Guest).filter(models.Guest.phone_no == new_guest.phone_no).first()
    if existing_guest:
        return existing_guest
    db.add(new_guest)
    db.commit()
    db.refresh(new_guest)
    return new_guest

@router.get('/guest', tags=['Guest'])
def get_guest(db: Session = Depends(get_db)):
    guests = db.query(models.Guest).all()
    return guests

@router.post('/reservations', tags=['Reservations'])
def book(request: schemas.BookingsBase, db: Session = Depends(get_db)):
    booking = models.Booking(room_id = request.room_id, guest_id = request.guest_id,
                             checkin_date = request.checkin_date, checkout_date = request.checkout_date,
                             total_price = request.total_price, payment_status = request.payment_status)
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

@router.get('/reservations', tags=['Reservations'])
def get_bookings(db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).all()
    return bookings

@router.post('/hall', tags=['Hall'])
def create_hall(request: schemas.HallBase, db: Session = Depends(get_db)):
    new_hall = models.Hall(hall_name = request.hall_name, seats = request.seats, cost = request.cost)
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
    booking = models.Booking(room_id = request.room_id, guest_id = request.guest_id,
                             checkin_date = request.checkin_date, checkout_date = request.checkout_date,
                             total_price = request.total_price, payment_status = request.payment_status)
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking