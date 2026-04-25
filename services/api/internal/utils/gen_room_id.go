package utils

import (
	"crypto/rand"
	"math/big"
)

// Generate ID
// 8 symbols example: fa2gs1jh

func GenerateID() string {
	lower := "abcdefghijklmnopqrstuvwxyz"
	numbers := "0123456789"
	charTypes := []struct {
		set  string
		name string
	}{
		{lower, "lower"},
		{numbers, "numbers"},
	}

	var enabledSets []string

	for _, ct := range charTypes {
		enabledSets = append(enabledSets, ct.set)
	}

	baseQuota := 8 / len(enabledSets)
	remainder := 8 % len(enabledSets)

	setCounts := make([]int, len(enabledSets))
	for i := range setCounts {
		setCounts[i] = baseQuota
	}

	for left := 0; left < remainder; left++ {
		i, err := cryptoRandInt(len(enabledSets))
		if err != nil {
			return ""
		}
		setCounts[i]++
	}

	var passRunes []rune

	for i, set := range enabledSets {
		for n := 0; n < setCounts[i]; n++ {
			idx, err := cryptoRandInt(len(set))
			if err != nil {
				return ""
			}
			passRunes = append(passRunes, rune(set[idx]))
		}
	}

	secureShuffle(passRunes)

	return string(passRunes)
}

func cryptoRandInt(max int) (int, error) {
	nBig, err := rand.Int(rand.Reader, big.NewInt(int64(max)))
	if err != nil {
		return 0, err
	}
	return int(nBig.Int64()), nil
}

func secureShuffle(a []rune) {
	for i := len(a) - 1; i > 0; i-- {
		jRand, err := cryptoRandInt(i + 1)
		if err != nil {
			return
		}
		a[i], a[jRand] = a[jRand], a[i]
	}
}
