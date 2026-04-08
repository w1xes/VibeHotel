"""
Unit tests for Pydantic schemas — no database, no HTTP calls.
"""
import uuid
from datetime import date

import pytest
from pydantic import ValidationError

from app.schemas.booking import BookingCreate
from app.schemas.property import PropertyCreate


class TestBookingCreate:
    BASE = dict(
        property_id=str(uuid.uuid4()),
        check_in=date(2024, 8, 1),
        check_out=date(2024, 8, 7),
        guests=2,
    )

    def test_valid_passes(self):
        b = BookingCreate(**self.BASE)  # type: ignore[arg-type]
        assert b.guests == 2

    def test_check_out_before_check_in_raises(self):
        with pytest.raises(ValidationError):
            BookingCreate(**{**self.BASE, "check_out": date(2024, 7, 31)})

    def test_check_out_equal_to_check_in_raises(self):
        with pytest.raises(ValidationError):
            BookingCreate(**{**self.BASE, "check_out": date(2024, 8, 1)})

    def test_guests_zero_raises(self):
        with pytest.raises(ValidationError):
            BookingCreate(**{**self.BASE, "guests": 0})

    def test_guests_negative_raises(self):
        with pytest.raises(ValidationError):
            BookingCreate(**{**self.BASE, "guests": -1})


class TestPropertyCreate:
    BASE = dict(title="Villa A", type="house", price=100.0, capacity=4)

    def test_valid_type_house(self):
        p = PropertyCreate(**self.BASE)  # type: ignore[arg-type]
        assert p.type == "house"

    def test_valid_type_suite(self):
        p = PropertyCreate(**{**self.BASE, "type": "suite"})
        assert p.type == "suite"

    def test_valid_type_room(self):
        p = PropertyCreate(**{**self.BASE, "type": "room"})
        assert p.type == "room"

    def test_invalid_type_raises(self):
        with pytest.raises(ValidationError):
            PropertyCreate(**{**self.BASE, "type": "villa"})

    def test_invalid_type_cabin_raises(self):
        with pytest.raises(ValidationError):
            PropertyCreate(**{**self.BASE, "type": "cabin"})
