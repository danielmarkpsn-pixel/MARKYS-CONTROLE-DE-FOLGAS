import pytest
from backend.main import parse_import_schedule

@pytest.mark.parametrize("text,hours,shift", [
    ("INTEGRAL 40H (08:00:00H A 12:00:00H - 13:00:00H A 17:00:00H)",40,"INTEGRAL"),
    ("MATUTINO  20H (8:00H - 12:00H)",20,"MANHÃ"),
    ("INTEGRAL 40H (07:00:00H A 11:00:00H - 12:00:00H A 16:00:00H)",40,"INTEGRAL"),
    ("INTEGRAL 40H (07:30H A 11:30H - 12:30H A 16:30H)",40,"INTEGRAL"),
    ("MATUTINO  30H (7:00H - 13:00H)",30,"MANHÃ"),
    ("MATUTINO  20H (7:00H - 11:00H)",20,"MANHÃ"),
    ("MATUTINO  30H (6:00H - 12:00H)",30,"MANHÃ"),
    ("VESPERTINO 30H (13:00H - 19:00H)",30,"TARDE"),
])
def test_schedule(text,hours,shift):
    assert parse_import_schedule(text,"") == (hours,shift)
    assert parse_import_schedule(None,text) == (hours,shift)
