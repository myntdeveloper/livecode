package utils

func ToString(val interface{}) string {
	if val == nil {
		return ""
	}
	str, ok := val.(string)
	if ok {
		return str
	}
	return ""
}
