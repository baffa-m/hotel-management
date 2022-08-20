from email.policy import default
from numbers import Real
from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Boolean, Column, Time, Float, Table
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, date


class Booking(Base):
    __tablename__ = "bookingTable"
    id = Column(Integer, primary_key=True)
    room_id = Column(Integer, ForeignKey('roomTable.id')) #FK
    guest_id = Column(Integer, ForeignKey('guestTable.id')) #Fk
    booking_date = Column(DateTime, default=date.today())
    checkin_date = Column(DateTime, nullable=False)
    checkout_date = Column(DateTime, nullable=False)
    total_price = Column(Integer, nullable=False)
    payment_status = Column(Boolean, default=False)
    
    guest = relationship('Guest', back_populates='booking')
    


class Guest(Base):
    __tablename__ = "guestTable"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    address = Column(String(50))
    phone_no = Column(String(12), nullable=False)
    room_id = Column(Integer, ForeignKey('roomTable.id'))
    
    room = relationship('Room', back_populates='person')
    booking = relationship('Booking', back_populates='guest')
    
    
class RoomType(Base):
    __tablename__ = "roomtypeTable"
    id = Column(Integer, primary_key=True)
    room_type = Column(String(100), nullable=False)
    description = Column(String(255))
    cost = Column(Integer, nullable=False) 
    
    room = relationship('Room', back_populates='room_type', cascade="all,delete-orphan")
    

class Room(Base):
    __tablename__ = "roomTable"
    id = Column(Integer, primary_key=True)
    room_name = Column(String(100), nullable=False, unique=True)
    room_typeid = Column(Integer, ForeignKey('roomtypeTable.id'))
    status = Column(Boolean, default=False)
    checked = Column(Boolean, default=False)
    room_type = relationship('RoomType', back_populates='room')
    person = relationship('Guest', back_populates='room')
    

class Hall(Base):
    __tablename__ = "hallTable"
    id = Column(Integer, primary_key=True)
    hall_name = Column(String(100), unique=True)
    seats = Column(Integer)
    booked = Column(Boolean, default=False)
    cost = Column(Integer)


class ReserveHall(Base):
    __tablename__ = "reserveHallTable"
    id = Column(Integer, primary_key=True)
    name = Column(String(200))
    phone_no = Column(String(14))
    date_from = Column(Date)
    date_to = Column(Date)
    