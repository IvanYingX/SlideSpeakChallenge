from datetime import datetime
from typing import Union, Any

def json_safe(obj: Union[dict, list, datetime, Any]) -> Union[dict, list, str]:
    '''
    Recursively convert datetime objects to strings
    '''
    # The websocket was having problems parsing datetimes
    if isinstance(obj, dict):
        return {k: json_safe(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [json_safe(i) for i in obj]
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj
