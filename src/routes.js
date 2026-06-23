/**
 * 真实航班航线数据（自动生成，请勿手改）。
 * 来源：OpenFlights 公开数据集 https://github.com/jpatokal/openflights
 * 生成脚本：scripts/build_routes.mjs
 *
 * 结构：ROUTES[出发ICAO] = [{ iata,icao,name,city,country,lon,lat,airlines:[] }]
 *   按运营航司数（热门度）降序排列。airlines 为 IATA 航司代码列表。
 */
export const ROUTES = {
 "VHHH": [
  {
   "iata": "BKK",
   "icao": "VTBS",
   "name": "Suvarnabhumi Airport",
   "city": "Bangkok",
   "country": "Thailand",
   "lon": 100.747,
   "lat": 13.6811,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "EK",
     "name": "Emirates"
    },
    {
     "code": "EY",
     "name": "Etihad Airways"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "KQ",
     "name": "Kenya Airways"
    },
    {
     "code": "MD",
     "name": "Air Madagascar"
    },
    {
     "code": "OX",
     "name": "Orient Thai Airlines"
    },
    {
     "code": "PG",
     "name": "Bangkok Airways"
    },
    {
     "code": "RJ",
     "name": "Royal Jordanian"
    },
    {
     "code": "TG",
     "name": "Thai Airways International"
    },
    {
     "code": "TK",
     "name": "Turkish Airlines"
    },
    {
     "code": "UL",
     "name": "SriLankan Airlines"
    }
   ]
  },
  {
   "iata": "ICN",
   "icao": "RKSI",
   "name": "Incheon International Airport",
   "city": "Seoul",
   "country": "South Korea",
   "lon": 126.451,
   "lat": 37.4691,
   "airlines": [
    {
     "code": "7C",
     "name": "Jeju Air"
    },
    {
     "code": "AI",
     "name": "Air India Limited"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "ET",
     "name": "Ethiopian Airlines"
    },
    {
     "code": "KE",
     "name": "Korean Air"
    },
    {
     "code": "LJ",
     "name": "Jin Air"
    },
    {
     "code": "OZ",
     "name": "Asiana Airlines"
    },
    {
     "code": "TG",
     "name": "Thai Airways International"
    },
    {
     "code": "UO",
     "name": "Hong Kong Express Airways"
    }
   ]
  },
  {
   "iata": "SIN",
   "icao": "WSSS",
   "name": "Singapore Changi Airport",
   "city": "Singapore",
   "country": "Singapore",
   "lon": 103.994,
   "lat": 1.35019,
   "airlines": [
    {
     "code": "3K",
     "name": "Jetstar Asia Airways"
    },
    {
     "code": "AI",
     "name": "Air India Limited"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "SQ",
     "name": "Singapore Airlines"
    },
    {
     "code": "TR",
     "name": "Tiger Airways"
    },
    {
     "code": "TZ",
     "name": "Scoot"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    }
   ]
  },
  {
   "iata": "HGH",
   "icao": "ZSHC",
   "name": "Hangzhou Xiaoshan International Airport",
   "city": "Hangzhou",
   "country": "China",
   "lon": 120.434,
   "lat": 30.2295,
   "airlines": [
    {
     "code": "CA",
     "name": "Air China"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "FM",
     "name": "Shanghai Airlines"
    },
    {
     "code": "HU",
     "name": "Hainan Airlines"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "MU",
     "name": "China Eastern Airlines"
    }
   ]
  },
  {
   "iata": "PVG",
   "icao": "ZSPD",
   "name": "Shanghai Pudong International Airport",
   "city": "Shanghai",
   "country": "China",
   "lon": 121.805,
   "lat": 31.1434,
   "airlines": [
    {
     "code": "9C",
     "name": "China SSS"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "FM",
     "name": "Shanghai Airlines"
    },
    {
     "code": "HO",
     "name": "Juneyao Airlines"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "MU",
     "name": "China Eastern Airlines"
    }
   ]
  },
  {
   "iata": "PEK",
   "icao": "ZBAA",
   "name": "Beijing Capital International Airport",
   "city": "Beijing",
   "country": "China",
   "lon": 116.585,
   "lat": 40.0801,
   "airlines": [
    {
     "code": "CA",
     "name": "Air China"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "CZ",
     "name": "China Southern Airlines"
    },
    {
     "code": "HU",
     "name": "Hainan Airlines"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "CTU",
   "icao": "ZUUU",
   "name": "Chengdu Shuangliu International Airport",
   "city": "Chengdu",
   "country": "China",
   "lon": 103.947,
   "lat": 30.5785,
   "airlines": [
    {
     "code": "3U",
     "name": "Sichuan Airlines"
    },
    {
     "code": "CA",
     "name": "Air China"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "HU",
     "name": "Hainan Airlines"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "NKG",
   "icao": "ZSNJ",
   "name": "Nanjing Lukou Airport",
   "city": "Nanjing",
   "country": "China",
   "lon": 118.862,
   "lat": 31.742,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "FM",
     "name": "Shanghai Airlines"
    },
    {
     "code": "HU",
     "name": "Hainan Airlines"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "MU",
     "name": "China Eastern Airlines"
    }
   ]
  },
  {
   "iata": "KIX",
   "icao": "RJBB",
   "name": "Kansai International Airport",
   "city": "Osaka",
   "country": "Japan",
   "lon": 135.244,
   "lat": 34.4273,
   "airlines": [
    {
     "code": "AI",
     "name": "Air India Limited"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "JL",
     "name": "Japan Airlines"
    },
    {
     "code": "MM",
     "name": "Peach Aviation"
    },
    {
     "code": "NH",
     "name": "All Nippon Airways"
    },
    {
     "code": "UO",
     "name": "Hong Kong Express Airways"
    }
   ]
  },
  {
   "iata": "SFO",
   "icao": "KSFO",
   "name": "San Francisco International Airport",
   "city": "San Francisco",
   "country": "United States",
   "lon": -122.375,
   "lat": 37.619,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AI",
     "name": "Air India Limited"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "SQ",
     "name": "Singapore Airlines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    }
   ]
  },
  {
   "iata": "TPE",
   "icao": "RCTP",
   "name": "Taiwan Taoyuan International Airport",
   "city": "Taipei",
   "country": "Taiwan",
   "lon": 121.233,
   "lat": 25.0777,
   "airlines": [
    {
     "code": "BR",
     "name": "EVA Air"
    },
    {
     "code": "CI",
     "name": "China Airlines"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "JL",
     "name": "Japan Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "CKG",
   "icao": "ZUCK",
   "name": "Chongqing Jiangbei International Airport",
   "city": "Chongqing",
   "country": "China",
   "lon": 106.642,
   "lat": 29.7192,
   "airlines": [
    {
     "code": "CA",
     "name": "Air China"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "HU",
     "name": "Hainan Airlines"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "DEL",
   "icao": "VIDP",
   "name": "Indira Gandhi International Airport",
   "city": "Delhi",
   "country": "India",
   "lon": 77.1031,
   "lat": 28.5665,
   "airlines": [
    {
     "code": "9W",
     "name": "Jet Airways"
    },
    {
     "code": "AI",
     "name": "Air India Limited"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "EY",
     "name": "Etihad Airways"
    },
    {
     "code": "OZ",
     "name": "Asiana Airlines"
    }
   ]
  },
  {
   "iata": "DPS",
   "icao": "WADD",
   "name": "Ngurah Rai (Bali) International Airport",
   "city": "Denpasar",
   "country": "Indonesia",
   "lon": 115.167,
   "lat": -8.74817,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "GA",
     "name": "Garuda Indonesia"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "RI",
     "name": "Mandala Airlines"
    }
   ]
  },
  {
   "iata": "BKI",
   "icao": "WBKK",
   "name": "Kota Kinabalu International Airport",
   "city": "Kota Kinabalu",
   "country": "Malaysia",
   "lon": 116.051,
   "lat": 5.93721,
   "airlines": [
    {
     "code": "AK",
     "name": "AirAsia"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "MH",
     "name": "Malaysia Airlines"
    },
    {
     "code": "UO",
     "name": "Hong Kong Express Airways"
    }
   ]
  },
  {
   "iata": "HKT",
   "icao": "VTSP",
   "name": "Phuket International Airport",
   "city": "Phuket",
   "country": "Thailand",
   "lon": 98.3169,
   "lat": 8.1132,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "FD",
     "name": "Thai AirAsia"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "TG",
     "name": "Thai Airways International"
    },
    {
     "code": "UO",
     "name": "Hong Kong Express Airways"
    }
   ]
  },
  {
   "iata": "SHA",
   "icao": "ZSSS",
   "name": "Shanghai Hongqiao International Airport",
   "city": "Shanghai",
   "country": "China",
   "lon": 121.336,
   "lat": 31.1979,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "FM",
     "name": "Shanghai Airlines"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "MU",
     "name": "China Eastern Airlines"
    }
   ]
  },
  {
   "iata": "NRT",
   "icao": "RJAA",
   "name": "Narita International Airport",
   "city": "Tokyo",
   "country": "Japan",
   "lon": 140.386,
   "lat": 35.7647,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "JL",
     "name": "Japan Airlines"
    },
    {
     "code": "NH",
     "name": "All Nippon Airways"
    }
   ]
  },
  {
   "iata": "XMN",
   "icao": "ZSAM",
   "name": "Xiamen Gaoqi International Airport",
   "city": "Xiamen",
   "country": "China",
   "lon": 118.128,
   "lat": 24.544,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "CZ",
     "name": "China Southern Airlines"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "MF",
     "name": "Xiamen Airlines"
    }
   ]
  },
  {
   "iata": "PUS",
   "icao": "RKPK",
   "name": "Gimhae International Airport",
   "city": "Busan",
   "country": "South Korea",
   "lon": 128.938,
   "lat": 35.1795,
   "airlines": [
    {
     "code": "BX",
     "name": "Air Busan"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "KE",
     "name": "Korean Air"
    }
   ]
  },
  {
   "iata": "CNS",
   "icao": "YBCS",
   "name": "Cairns International Airport",
   "city": "Cairns",
   "country": "Australia",
   "lon": 145.755,
   "lat": -16.8858,
   "airlines": [
    {
     "code": "AY",
     "name": "Finnair"
    },
    {
     "code": "BA",
     "name": "British Airways"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "JL",
     "name": "Japan Airlines"
    }
   ]
  },
  {
   "iata": "CNX",
   "icao": "VTCC",
   "name": "Chiang Mai International Airport",
   "city": "Chiang Mai",
   "country": "Thailand",
   "lon": 98.9626,
   "lat": 18.7668,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "FD",
     "name": "Thai AirAsia"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "UO",
     "name": "Hong Kong Express Airways"
    }
   ]
  },
  {
   "iata": "FOC",
   "icao": "ZSFZ",
   "name": "Fuzhou Changle International Airport",
   "city": "Fuzhou",
   "country": "China",
   "lon": 119.663,
   "lat": 25.9351,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "HU",
     "name": "Hainan Airlines"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "HAK",
   "icao": "ZJHK",
   "name": "Haikou Meilan International Airport",
   "city": "Haikou",
   "country": "China",
   "lon": 110.459,
   "lat": 19.9349,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "HU",
     "name": "Hainan Airlines"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "HAN",
   "icao": "VVNB",
   "name": "Noi Bai International Airport",
   "city": "Hanoi",
   "country": "Vietnam",
   "lon": 105.807,
   "lat": 21.2212,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "VN",
     "name": "Vietnam Airlines"
    }
   ]
  },
  {
   "iata": "SGN",
   "icao": "VVTS",
   "name": "Tan Son Nhat International Airport",
   "city": "Ho Chi Minh City",
   "country": "Vietnam",
   "lon": 106.652,
   "lat": 10.8188,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "VN",
     "name": "Vietnam Airlines"
    }
   ]
  },
  {
   "iata": "CGK",
   "icao": "WIII",
   "name": "Soekarno-Hatta International Airport",
   "city": "Jakarta",
   "country": "Indonesia",
   "lon": 106.656,
   "lat": -6.12557,
   "airlines": [
    {
     "code": "CI",
     "name": "China Airlines"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "EY",
     "name": "Etihad Airways"
    },
    {
     "code": "GA",
     "name": "Garuda Indonesia"
    }
   ]
  },
  {
   "iata": "KMG",
   "icao": "ZPPP",
   "name": "Kunming Changshui International Airport",
   "city": "Kunming",
   "country": "China",
   "lon": 102.92917,
   "lat": 25.10194,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "MU",
     "name": "China Eastern Airlines"
    },
    {
     "code": "UO",
     "name": "Hong Kong Express Airways"
    }
   ]
  },
  {
   "iata": "MNL",
   "icao": "RPLL",
   "name": "Ninoy Aquino International Airport",
   "city": "Manila",
   "country": "Philippines",
   "lon": 121.02,
   "lat": 14.5086,
   "airlines": [
    {
     "code": "5J",
     "name": "Cebu Pacific"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "PR",
     "name": "Philippine Airlines"
    }
   ]
  },
  {
   "iata": "NGB",
   "icao": "ZSNB",
   "name": "Ningbo Lishe International Airport",
   "city": "Ninbo",
   "country": "China",
   "lon": 121.462,
   "lat": 29.8267,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "FM",
     "name": "Shanghai Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "MU",
     "name": "China Eastern Airlines"
    }
   ]
  },
  {
   "iata": "HND",
   "icao": "RJTT",
   "name": "Tokyo Haneda International Airport",
   "city": "Tokyo",
   "country": "Japan",
   "lon": 139.78,
   "lat": 35.5523,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "JL",
     "name": "Japan Airlines"
    },
    {
     "code": "NH",
     "name": "All Nippon Airways"
    },
    {
     "code": "UO",
     "name": "Hong Kong Express Airways"
    }
   ]
  },
  {
   "iata": "WUH",
   "icao": "ZHHH",
   "name": "Wuhan Tianhe International Airport",
   "city": "Wuhan",
   "country": "China",
   "lon": 114.208,
   "lat": 30.7838,
   "airlines": [
    {
     "code": "CA",
     "name": "Air China"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "CZ",
     "name": "China Southern Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "AUH",
   "icao": "OMAA",
   "name": "Abu Dhabi International Airport",
   "city": "Abu Dhabi",
   "country": "United Arab Emirates",
   "lon": 54.6511,
   "lat": 24.433,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "EY",
     "name": "Etihad Airways"
    },
    {
     "code": "HM",
     "name": "Air Seychelles"
    }
   ]
  },
  {
   "iata": "CRK",
   "icao": "RPLC",
   "name": "Diosdado Macapagal International Airport",
   "city": "Angeles City",
   "country": "Philippines",
   "lon": 120.56,
   "lat": 15.186,
   "airlines": [
    {
     "code": "5J",
     "name": "Cebu Pacific"
    },
    {
     "code": "DG",
     "name": "South East Asian Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "AKL",
   "icao": "NZAA",
   "name": "Auckland International Airport",
   "city": "Auckland",
   "country": "New Zealand",
   "lon": 174.79201,
   "lat": -37.0081,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "NZ",
     "name": "Air New Zealand"
    },
    {
     "code": "TG",
     "name": "Thai Airways International"
    }
   ]
  },
  {
   "iata": "BNE",
   "icao": "YBBN",
   "name": "Brisbane International Airport",
   "city": "Brisbane",
   "country": "Australia",
   "lon": 153.117,
   "lat": -27.3842,
   "airlines": [
    {
     "code": "AY",
     "name": "Finnair"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "QF",
     "name": "Qantas"
    }
   ]
  },
  {
   "iata": "CEB",
   "icao": "RPVM",
   "name": "Mactan Cebu International Airport",
   "city": "Cebu",
   "country": "Philippines",
   "lon": 123.979,
   "lat": 10.3075,
   "airlines": [
    {
     "code": "5J",
     "name": "Cebu Pacific"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "PR",
     "name": "Philippine Airlines"
    }
   ]
  },
  {
   "iata": "ORD",
   "icao": "KORD",
   "name": "Chicago O'Hare International Airport",
   "city": "Chicago",
   "country": "United States",
   "lon": -87.9048,
   "lat": 41.9786,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "DAC",
   "icao": "VGZR",
   "name": "Hazrat Shahjalal International Airport",
   "city": "Dhaka",
   "country": "Bangladesh",
   "lon": 90.39778,
   "lat": 23.84335,
   "airlines": [
    {
     "code": "BG",
     "name": "Biman Bangladesh Airlines"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "FUK",
   "icao": "RJFF",
   "name": "Fukuoka Airport",
   "city": "Fukuoka",
   "country": "Japan",
   "lon": 130.451,
   "lat": 33.5859,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "UO",
     "name": "Hong Kong Express Airways"
    }
   ]
  },
  {
   "iata": "CAN",
   "icao": "ZGGG",
   "name": "Guangzhou Baiyun International Airport",
   "city": "Guangzhou",
   "country": "China",
   "lon": 113.299,
   "lat": 23.3924,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "CZ",
     "name": "China Southern Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "KWL",
   "icao": "ZGKL",
   "name": "Guilin Liangjiang International Airport",
   "city": "Guilin",
   "country": "China",
   "lon": 110.039,
   "lat": 25.2181,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "KHH",
   "icao": "RCKH",
   "name": "Kaohsiung International Airport",
   "city": "Kaohsiung",
   "country": "Taiwan",
   "lon": 120.35,
   "lat": 22.5771,
   "airlines": [
    {
     "code": "CI",
     "name": "China Airlines"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "KUL",
   "icao": "WMKK",
   "name": "Kuala Lumpur International Airport",
   "city": "Kuala Lumpur",
   "country": "Malaysia",
   "lon": 101.71,
   "lat": 2.74558,
   "airlines": [
    {
     "code": "AK",
     "name": "AirAsia"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "MH",
     "name": "Malaysia Airlines"
    }
   ]
  },
  {
   "iata": "LHR",
   "icao": "EGLL",
   "name": "London Heathrow Airport",
   "city": "London",
   "country": "United Kingdom",
   "lon": -0.46194,
   "lat": 51.4706,
   "airlines": [
    {
     "code": "BA",
     "name": "British Airways"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "VS",
     "name": "Virgin Atlantic Airways"
    }
   ]
  },
  {
   "iata": "MEL",
   "icao": "YMML",
   "name": "Melbourne International Airport",
   "city": "Melbourne",
   "country": "Australia",
   "lon": 144.843,
   "lat": -37.6733,
   "airlines": [
    {
     "code": "AY",
     "name": "Finnair"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "QF",
     "name": "Qantas"
    }
   ]
  },
  {
   "iata": "DME",
   "icao": "UUDD",
   "name": "Domodedovo International Airport",
   "city": "Moscow",
   "country": "Russia",
   "lon": 37.9063,
   "lat": 55.4088,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "S7",
     "name": "S7 Airlines"
    },
    {
     "code": "UN",
     "name": "Transaero Airlines"
    }
   ]
  },
  {
   "iata": "BOM",
   "icao": "VABB",
   "name": "Chhatrapati Shivaji International Airport",
   "city": "Mumbai",
   "country": "India",
   "lon": 72.8679,
   "lat": 19.0887,
   "airlines": [
    {
     "code": "9W",
     "name": "Jet Airways"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "EY",
     "name": "Etihad Airways"
    }
   ]
  },
  {
   "iata": "NGO",
   "icao": "RJGG",
   "name": "Chubu Centrair International Airport",
   "city": "Nagoya",
   "country": "Japan",
   "lon": 136.80499,
   "lat": 34.8584,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "JL",
     "name": "Japan Airlines"
    },
    {
     "code": "NH",
     "name": "All Nippon Airways"
    }
   ]
  },
  {
   "iata": "EWR",
   "icao": "KEWR",
   "name": "Newark Liberty International Airport",
   "city": "Newark",
   "country": "United States",
   "lon": -74.1687,
   "lat": 40.6925,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "OKA",
   "icao": "ROAH",
   "name": "Naha Airport",
   "city": "Okinawa",
   "country": "Japan",
   "lon": 127.646,
   "lat": 26.1958,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "CDG",
   "icao": "LFPG",
   "name": "Charles de Gaulle International Airport",
   "city": "Paris",
   "country": "France",
   "lon": 2.55,
   "lat": 49.0128,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    }
   ]
  },
  {
   "iata": "PEN",
   "icao": "WMKP",
   "name": "Penang International Airport",
   "city": "Penang",
   "country": "Malaysia",
   "lon": 100.277,
   "lat": 5.29714,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "UO",
     "name": "Hong Kong Express Airways"
    }
   ]
  },
  {
   "iata": "SYX",
   "icao": "ZJSY",
   "name": "Sanya Phoenix International Airport",
   "city": "Sanya",
   "country": "China",
   "lon": 109.412,
   "lat": 18.3029,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "SYD",
   "icao": "YSSY",
   "name": "Sydney Kingsford Smith International Airport",
   "city": "Sydney",
   "country": "Australia",
   "lon": 151.177,
   "lat": -33.9461,
   "airlines": [
    {
     "code": "AY",
     "name": "Finnair"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "QF",
     "name": "Qantas"
    }
   ]
  },
  {
   "iata": "RMQ",
   "icao": "RCMQ",
   "name": "Taichung Ching Chuang Kang Airport",
   "city": "Taichung",
   "country": "Taiwan",
   "lon": 120.621,
   "lat": 24.2647,
   "airlines": [
    {
     "code": "AE",
     "name": "Mandarin Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "UO",
     "name": "Hong Kong Express Airways"
    }
   ]
  },
  {
   "iata": "TSN",
   "icao": "ZBTJ",
   "name": "Tianjin Binhai International Airport",
   "city": "Tianjin",
   "country": "China",
   "lon": 117.346,
   "lat": 39.1244,
   "airlines": [
    {
     "code": "CA",
     "name": "Air China"
    },
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "WNZ",
   "icao": "ZSWZ",
   "name": "Wenzhou Longwan International Airport",
   "city": "Wenzhou",
   "country": "China",
   "lon": 120.852,
   "lat": 27.9122,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "MU",
     "name": "China Eastern Airlines"
    }
   ]
  },
  {
   "iata": "XIY",
   "icao": "ZLXY",
   "name": "Xi'an Xianyang International Airport",
   "city": "Xi'an",
   "country": "China",
   "lon": 108.752,
   "lat": 34.4471,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    },
    {
     "code": "MU",
     "name": "China Eastern Airlines"
    }
   ]
  },
  {
   "iata": "CGO",
   "icao": "ZHCC",
   "name": "Zhengzhou Xinzheng International Airport",
   "city": "Zhengzhou",
   "country": "China",
   "lon": 113.841,
   "lat": 34.5197,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "CZ",
     "name": "China Southern Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "AMS",
   "icao": "EHAM",
   "name": "Amsterdam Airport Schiphol",
   "city": "Amsterdam",
   "country": "Netherlands",
   "lon": 4.76389,
   "lat": 52.3086,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KL",
     "name": "KLM Royal Dutch Airlines"
    }
   ]
  },
  {
   "iata": "BWN",
   "icao": "WBSB",
   "name": "Brunei International Airport",
   "city": "Bandar Seri Begawan",
   "country": "Brunei",
   "lon": 114.928,
   "lat": 4.9442,
   "airlines": [
    {
     "code": "BI",
     "name": "Royal Brunei Airlines"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "BLR",
   "icao": "VOBL",
   "name": "Kempegowda International Airport",
   "city": "Bangalore",
   "country": "India",
   "lon": 77.7063,
   "lat": 13.1979,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "CSX",
   "icao": "ZGHA",
   "name": "Changsha Huanghua International Airport",
   "city": "Changcha",
   "country": "China",
   "lon": 113.22,
   "lat": 28.1892,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "CJU",
   "icao": "RKPC",
   "name": "Jeju International Airport",
   "city": "Cheju",
   "country": "South Korea",
   "lon": 126.493,
   "lat": 33.5113,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "DLC",
   "icao": "ZYTL",
   "name": "Zhoushuizi Airport",
   "city": "Dalian",
   "country": "China",
   "lon": 121.539,
   "lat": 38.9657,
   "airlines": [
    {
     "code": "CA",
     "name": "Air China"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "DAD",
   "icao": "VVDN",
   "name": "Da Nang International Airport",
   "city": "Danang",
   "country": "Vietnam",
   "lon": 108.199,
   "lat": 16.0439,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "DOH",
   "icao": "OTHH",
   "name": "Hamad International Airport",
   "city": "Doha",
   "country": "Qatar",
   "lon": 51.60806,
   "lat": 25.27306,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "QR",
     "name": "Qatar Airways"
    }
   ]
  },
  {
   "iata": "DXB",
   "icao": "OMDB",
   "name": "Dubai International Airport",
   "city": "Dubai",
   "country": "United Arab Emirates",
   "lon": 55.3644,
   "lat": 25.2528,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "EK",
     "name": "Emirates"
    }
   ]
  },
  {
   "iata": "FRA",
   "icao": "EDDF",
   "name": "Frankfurt am Main Airport",
   "city": "Frankfurt",
   "country": "Germany",
   "lon": 8.57056,
   "lat": 50.03333,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "LH",
     "name": "Lufthansa"
    }
   ]
  },
  {
   "iata": "JNB",
   "icao": "FAOR",
   "name": "OR Tambo International Airport",
   "city": "Johannesburg",
   "country": "South Africa",
   "lon": 28.246,
   "lat": -26.1392,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "SA",
     "name": "South African Airways"
    }
   ]
  },
  {
   "iata": "KHV",
   "icao": "UHHH",
   "name": "Khabarovsk-Novy Airport",
   "city": "Khabarovsk",
   "country": "Russia",
   "lon": 135.188,
   "lat": 48.528,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "S7",
     "name": "S7 Airlines"
    }
   ]
  },
  {
   "iata": "USM",
   "icao": "VTSM",
   "name": "Samui Airport",
   "city": "Ko Samui",
   "country": "Thailand",
   "lon": 100.062,
   "lat": 9.54779,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "PG",
     "name": "Bangkok Airways"
    }
   ]
  },
  {
   "iata": "CCU",
   "icao": "VECC",
   "name": "Netaji Subhash Chandra Bose International Airport",
   "city": "Kolkata",
   "country": "India",
   "lon": 88.4467,
   "lat": 22.6547,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "LAX",
   "icao": "KLAX",
   "name": "Los Angeles International Airport",
   "city": "Los Angeles",
   "country": "United States",
   "lon": -118.408,
   "lat": 33.9425,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    }
   ]
  },
  {
   "iata": "MLE",
   "icao": "VRMM",
   "name": "Malé International Airport",
   "city": "Male",
   "country": "Maldives",
   "lon": 73.5291,
   "lat": 4.19183,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "NAN",
   "icao": "NFFN",
   "name": "Nadi International Airport",
   "city": "Nandi",
   "country": "Fiji",
   "lon": 177.44299,
   "lat": -17.7554,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "FJ",
     "name": "Air Pacific"
    }
   ]
  },
  {
   "iata": "JFK",
   "icao": "KJFK",
   "name": "John F Kennedy International Airport",
   "city": "New York",
   "country": "United States",
   "lon": -73.7789,
   "lat": 40.6398,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    }
   ]
  },
  {
   "iata": "TAO",
   "icao": "ZSQD",
   "name": "Liuting Airport",
   "city": "Qingdao",
   "country": "China",
   "lon": 120.374,
   "lat": 36.2661,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "KA",
     "name": "Dragonair"
    }
   ]
  },
  {
   "iata": "CTS",
   "icao": "RJCC",
   "name": "New Chitose Airport",
   "city": "Sapporo",
   "country": "Japan",
   "lon": 141.692,
   "lat": 42.7752,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "JL",
     "name": "Japan Airlines"
    }
   ]
  },
  {
   "iata": "TYN",
   "icao": "ZBYN",
   "name": "Taiyuan Wusu Airport",
   "city": "Taiyuan",
   "country": "China",
   "lon": 112.628,
   "lat": 37.7469,
   "airlines": [
    {
     "code": "HX",
     "name": "Hong Kong Airlines"
    },
    {
     "code": "MU",
     "name": "China Eastern Airlines"
    }
   ]
  },
  {
   "iata": "YYZ",
   "icao": "CYYZ",
   "name": "Lester B. Pearson International Airport",
   "city": "Toronto",
   "country": "Canada",
   "lon": -79.6306,
   "lat": 43.6772,
   "airlines": [
    {
     "code": "AC",
     "name": "Air Canada"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    }
   ]
  },
  {
   "iata": "ULN",
   "icao": "ZMUB",
   "name": "Chinggis Khaan International Airport",
   "city": "Ulan Bator",
   "country": "Mongolia",
   "lon": 106.767,
   "lat": 47.8431,
   "airlines": [
    {
     "code": "MR",
     "name": "Homer Air"
    },
    {
     "code": "OM",
     "name": "MIAT Mongolian Airlines"
    }
   ]
  },
  {
   "iata": "YVR",
   "icao": "CYVR",
   "name": "Vancouver International Airport",
   "city": "Vancouver",
   "country": "Canada",
   "lon": -123.184,
   "lat": 49.1939,
   "airlines": [
    {
     "code": "AC",
     "name": "Air Canada"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    }
   ]
  },
  {
   "iata": "VVO",
   "icao": "UHWW",
   "name": "Vladivostok International Airport",
   "city": "Vladivostok",
   "country": "Russia",
   "lon": 132.14799,
   "lat": 43.399,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "S7",
     "name": "S7 Airlines"
    }
   ]
  },
  {
   "iata": "ADD",
   "icao": "HAAB",
   "name": "Addis Ababa Bole International Airport",
   "city": "Addis Ababa",
   "country": "Ethiopia",
   "lon": 38.7993,
   "lat": 8.97789,
   "airlines": [
    {
     "code": "ET",
     "name": "Ethiopian Airlines"
    }
   ]
  },
  {
   "iata": "ADL",
   "icao": "YPAD",
   "name": "Adelaide International Airport",
   "city": "Adelaide",
   "country": "Australia",
   "lon": 138.53101,
   "lat": -34.945,
   "airlines": [
    {
     "code": "CX",
     "name": "Cathay Pacific"
    }
   ]
  },
  {
   "iata": "GUM",
   "icao": "PGUM",
   "name": "Antonio B. Won Pat International Airport",
   "city": "Agana",
   "country": "Guam",
   "lon": 144.79601,
   "lat": 13.4834,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "ALA",
   "icao": "UAAA",
   "name": "Almaty Airport",
   "city": "Alma-ata",
   "country": "Kazakhstan",
   "lon": 77.0405,
   "lat": 43.3521,
   "airlines": [
    {
     "code": "KC",
     "name": "Air Astana"
    }
   ]
  },
  {
   "iata": "DMK",
   "icao": "VTBD",
   "name": "Don Mueang International Airport",
   "city": "Bangkok",
   "country": "Thailand",
   "lon": 100.607,
   "lat": 13.9126,
   "airlines": [
    {
     "code": "FD",
     "name": "Thai AirAsia"
    }
   ]
  }
 ],
 "KSFO": [
  {
   "iata": "ATL",
   "icao": "KATL",
   "name": "Hartsfield Jackson Atlanta International Airport",
   "city": "Atlanta",
   "country": "United States",
   "lon": -84.4281,
   "lat": 33.6367,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AM",
     "name": "AeroMéxico"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "CI",
     "name": "China Airlines"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "FL",
     "name": "AirTran Airways"
    },
    {
     "code": "KL",
     "name": "KLM Royal Dutch Airlines"
    },
    {
     "code": "NZ",
     "name": "Air New Zealand"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "VS",
     "name": "Virgin Atlantic Airways"
    },
    {
     "code": "WN",
     "name": "Southwest Airlines"
    }
   ]
  },
  {
   "iata": "LHR",
   "icao": "EGLL",
   "name": "London Heathrow Airport",
   "city": "London",
   "country": "United Kingdom",
   "lon": -0.46194,
   "lat": 51.4706,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AY",
     "name": "Finnair"
    },
    {
     "code": "BA",
     "name": "British Airways"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "IB",
     "name": "Iberia Airlines"
    },
    {
     "code": "LH",
     "name": "Lufthansa"
    },
    {
     "code": "NZ",
     "name": "Air New Zealand"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "UN",
     "name": "Transaero Airlines"
    },
    {
     "code": "VS",
     "name": "Virgin Atlantic Airways"
    }
   ]
  },
  {
   "iata": "LAX",
   "icao": "KLAX",
   "name": "Los Angeles International Airport",
   "city": "Los Angeles",
   "country": "United States",
   "lon": -118.408,
   "lat": 33.9425,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AS",
     "name": "Alaska Airlines"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    },
    {
     "code": "WN",
     "name": "Southwest Airlines"
    }
   ]
  },
  {
   "iata": "JFK",
   "icao": "KJFK",
   "name": "John F Kennedy International Airport",
   "city": "New York",
   "country": "United States",
   "lon": -73.7789,
   "lat": 40.6398,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AS",
     "name": "Alaska Airlines"
    },
    {
     "code": "B6",
     "name": "JetBlue Airways"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    }
   ]
  },
  {
   "iata": "ICN",
   "icao": "RKSI",
   "name": "Incheon International Airport",
   "city": "Seoul",
   "country": "South Korea",
   "lon": 126.451,
   "lat": 37.4691,
   "airlines": [
    {
     "code": "AI",
     "name": "Air India Limited"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "KE",
     "name": "Korean Air"
    },
    {
     "code": "OZ",
     "name": "Asiana Airlines"
    },
    {
     "code": "SQ",
     "name": "Singapore Airlines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    }
   ]
  },
  {
   "iata": "HKG",
   "icao": "VHHH",
   "name": "Hong Kong International Airport",
   "city": "Hong Kong",
   "country": "Hong Kong",
   "lon": 113.915,
   "lat": 22.3089,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AI",
     "name": "Air India Limited"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    },
    {
     "code": "SQ",
     "name": "Singapore Airlines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    }
   ]
  },
  {
   "iata": "SEA",
   "icao": "KSEA",
   "name": "Seattle Tacoma International Airport",
   "city": "Seattle",
   "country": "United States",
   "lon": -122.309,
   "lat": 47.449,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AS",
     "name": "Alaska Airlines"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "KL",
     "name": "KLM Royal Dutch Airlines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    }
   ]
  },
  {
   "iata": "ORD",
   "icao": "KORD",
   "name": "Chicago O'Hare International Airport",
   "city": "Chicago",
   "country": "United States",
   "lon": -87.9048,
   "lat": 41.9786,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AS",
     "name": "Alaska Airlines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    }
   ]
  },
  {
   "iata": "DFW",
   "icao": "KDFW",
   "name": "Dallas Fort Worth International Airport",
   "city": "Dallas-Fort Worth",
   "country": "United States",
   "lon": -97.038,
   "lat": 32.8968,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AS",
     "name": "Alaska Airlines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    }
   ]
  },
  {
   "iata": "HNL",
   "icao": "PHNL",
   "name": "Daniel K Inouye International Airport",
   "city": "Honolulu",
   "country": "United States",
   "lon": -157.92423,
   "lat": 21.32062,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "HA",
     "name": "Hawaiian Airlines"
    },
    {
     "code": "KL",
     "name": "KLM Royal Dutch Airlines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "PVR",
   "icao": "MMPR",
   "name": "Licenciado Gustavo Díaz Ordaz International Airport",
   "city": "Puerto Vallarta",
   "country": "Mexico",
   "lon": -105.254,
   "lat": 20.6801,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AM",
     "name": "AeroMéxico"
    },
    {
     "code": "AS",
     "name": "Alaska Airlines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    }
   ]
  },
  {
   "iata": "TPE",
   "icao": "RCTP",
   "name": "Taiwan Taoyuan International Airport",
   "city": "Taipei",
   "country": "Taiwan",
   "lon": 121.233,
   "lat": 25.0777,
   "airlines": [
    {
     "code": "BR",
     "name": "EVA Air"
    },
    {
     "code": "CI",
     "name": "China Airlines"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    }
   ]
  },
  {
   "iata": "DEN",
   "icao": "KDEN",
   "name": "Denver International Airport",
   "city": "Denver",
   "country": "United States",
   "lon": -104.673,
   "lat": 39.8617,
   "airlines": [
    {
     "code": "F9",
     "name": "Frontier Airlines"
    },
    {
     "code": "FL",
     "name": "AirTran Airways"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "WN",
     "name": "Southwest Airlines"
    }
   ]
  },
  {
   "iata": "LAS",
   "icao": "KLAS",
   "name": "McCarran International Airport",
   "city": "Las Vegas",
   "country": "United States",
   "lon": -115.152,
   "lat": 36.0801,
   "airlines": [
    {
     "code": "HA",
     "name": "Hawaiian Airlines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    },
    {
     "code": "WN",
     "name": "Southwest Airlines"
    }
   ]
  },
  {
   "iata": "MEX",
   "icao": "MMMX",
   "name": "Licenciado Benito Juarez International Airport",
   "city": "Mexico City",
   "country": "Mexico",
   "lon": -99.0721,
   "lat": 19.4363,
   "airlines": [
    {
     "code": "AM",
     "name": "AeroMéxico"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "NZ",
     "name": "Air New Zealand"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "PSP",
   "icao": "KPSP",
   "name": "Palm Springs International Airport",
   "city": "Palm Springs",
   "country": "United States",
   "lon": -116.507,
   "lat": 33.8297,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AS",
     "name": "Alaska Airlines"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "CDG",
   "icao": "LFPG",
   "name": "Charles de Gaulle International Airport",
   "city": "Paris",
   "country": "France",
   "lon": 2.55,
   "lat": 49.0128,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "PHL",
   "icao": "KPHL",
   "name": "Philadelphia International Airport",
   "city": "Philadelphia",
   "country": "United States",
   "lon": -75.2411,
   "lat": 39.8719,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    }
   ]
  },
  {
   "iata": "PHX",
   "icao": "KPHX",
   "name": "Phoenix Sky Harbor International Airport",
   "city": "Phoenix",
   "country": "United States",
   "lon": -112.012,
   "lat": 33.4343,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    },
    {
     "code": "WN",
     "name": "Southwest Airlines"
    }
   ]
  },
  {
   "iata": "PDX",
   "icao": "KPDX",
   "name": "Portland International Airport",
   "city": "Portland",
   "country": "United States",
   "lon": -122.598,
   "lat": 45.5887,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AS",
     "name": "Alaska Airlines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    }
   ]
  },
  {
   "iata": "SJD",
   "icao": "MMSD",
   "name": "Los Cabos International Airport",
   "city": "San Jose Del Cabo",
   "country": "Mexico",
   "lon": -109.721,
   "lat": 23.1518,
   "airlines": [
    {
     "code": "AM",
     "name": "AeroMéxico"
    },
    {
     "code": "AS",
     "name": "Alaska Airlines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    }
   ]
  },
  {
   "iata": "PVG",
   "icao": "ZSPD",
   "name": "Shanghai Pudong International Airport",
   "city": "Shanghai",
   "country": "China",
   "lon": 121.805,
   "lat": 31.1434,
   "airlines": [
    {
     "code": "CA",
     "name": "Air China"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "MU",
     "name": "China Eastern Airlines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "AKL",
   "icao": "NZAA",
   "name": "Auckland International Airport",
   "city": "Auckland",
   "country": "New Zealand",
   "lon": 174.79201,
   "lat": -37.0081,
   "airlines": [
    {
     "code": "NZ",
     "name": "Air New Zealand"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    }
   ]
  },
  {
   "iata": "AUS",
   "icao": "KAUS",
   "name": "Austin Bergstrom International Airport",
   "city": "Austin",
   "country": "United States",
   "lon": -97.6699,
   "lat": 30.1945,
   "airlines": [
    {
     "code": "B6",
     "name": "JetBlue Airways"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    }
   ]
  },
  {
   "iata": "PEK",
   "icao": "ZBAA",
   "name": "Beijing Capital International Airport",
   "city": "Beijing",
   "country": "China",
   "lon": 116.585,
   "lat": 40.0801,
   "airlines": [
    {
     "code": "CA",
     "name": "Air China"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    }
   ]
  },
  {
   "iata": "BOS",
   "icao": "KBOS",
   "name": "General Edward Lawrence Logan International Airport",
   "city": "Boston",
   "country": "United States",
   "lon": -71.0052,
   "lat": 42.3643,
   "airlines": [
    {
     "code": "B6",
     "name": "JetBlue Airways"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    }
   ]
  },
  {
   "iata": "YYC",
   "icao": "CYYC",
   "name": "Calgary International Airport",
   "city": "Calgary",
   "country": "Canada",
   "lon": -114.02,
   "lat": 51.1139,
   "airlines": [
    {
     "code": "AC",
     "name": "Air Canada"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "WS",
     "name": "WestJet"
    }
   ]
  },
  {
   "iata": "FLL",
   "icao": "KFLL",
   "name": "Fort Lauderdale Hollywood International Airport",
   "city": "Fort Lauderdale",
   "country": "United States",
   "lon": -80.1527,
   "lat": 26.0726,
   "airlines": [
    {
     "code": "B6",
     "name": "JetBlue Airways"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    }
   ]
  },
  {
   "iata": "FRA",
   "icao": "EDDF",
   "name": "Frankfurt am Main Airport",
   "city": "Frankfurt",
   "country": "Germany",
   "lon": 8.57056,
   "lat": 50.03333,
   "airlines": [
    {
     "code": "LH",
     "name": "Lufthansa"
    },
    {
     "code": "NZ",
     "name": "Air New Zealand"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "GDL",
   "icao": "MMGL",
   "name": "Don Miguel Hidalgo Y Costilla International Airport",
   "city": "Guadalajara",
   "country": "Mexico",
   "lon": -103.311,
   "lat": 20.5218,
   "airlines": [
    {
     "code": "AM",
     "name": "AeroMéxico"
    },
    {
     "code": "NZ",
     "name": "Air New Zealand"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "MIA",
   "icao": "KMIA",
   "name": "Miami International Airport",
   "city": "Miami",
   "country": "United States",
   "lon": -80.2906,
   "lat": 25.7932,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AS",
     "name": "Alaska Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    }
   ]
  },
  {
   "iata": "MSP",
   "icao": "KMSP",
   "name": "Minneapolis-St Paul International/Wold-Chamberlain Airport",
   "city": "Minneapolis",
   "country": "United States",
   "lon": -93.2218,
   "lat": 44.882,
   "airlines": [
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "SY",
     "name": "Sun Country Airlines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "SAN",
   "icao": "KSAN",
   "name": "San Diego International Airport",
   "city": "San Diego",
   "country": "United States",
   "lon": -117.19,
   "lat": 32.7336,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    },
    {
     "code": "WN",
     "name": "Southwest Airlines"
    }
   ]
  },
  {
   "iata": "SAL",
   "icao": "MSLP",
   "name": "Monseñor Óscar Arnulfo Romero International Airport",
   "city": "San Salvador",
   "country": "El Salvador",
   "lon": -89.0557,
   "lat": 13.4409,
   "airlines": [
    {
     "code": "AV",
     "name": "Avianca - Aerovias Nacionales de Colombia"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    }
   ]
  },
  {
   "iata": "YVR",
   "icao": "CYVR",
   "name": "Vancouver International Airport",
   "city": "Vancouver",
   "country": "Canada",
   "lon": -123.184,
   "lat": 49.1939,
   "airlines": [
    {
     "code": "AC",
     "name": "Air Canada"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "WS",
     "name": "WestJet"
    }
   ]
  },
  {
   "iata": "AMS",
   "icao": "EHAM",
   "name": "Amsterdam Airport Schiphol",
   "city": "Amsterdam",
   "country": "Netherlands",
   "lon": 4.76389,
   "lat": 52.3086,
   "airlines": [
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "KL",
     "name": "KLM Royal Dutch Airlines"
    }
   ]
  },
  {
   "iata": "CUN",
   "icao": "MMUN",
   "name": "Cancún International Airport",
   "city": "Cancun",
   "country": "Mexico",
   "lon": -86.8771,
   "lat": 21.0365,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    }
   ]
  },
  {
   "iata": "CLT",
   "icao": "KCLT",
   "name": "Charlotte Douglas International Airport",
   "city": "Charlotte",
   "country": "United States",
   "lon": -80.9431,
   "lat": 35.214,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    }
   ]
  },
  {
   "iata": "MDW",
   "icao": "KMDW",
   "name": "Chicago Midway International Airport",
   "city": "Chicago",
   "country": "United States",
   "lon": -87.7524,
   "lat": 41.786,
   "airlines": [
    {
     "code": "FL",
     "name": "AirTran Airways"
    },
    {
     "code": "WN",
     "name": "Southwest Airlines"
    }
   ]
  },
  {
   "iata": "DXB",
   "icao": "OMDB",
   "name": "Dubai International Airport",
   "city": "Dubai",
   "country": "United Arab Emirates",
   "lon": 55.3644,
   "lat": 25.2528,
   "airlines": [
    {
     "code": "B6",
     "name": "JetBlue Airways"
    },
    {
     "code": "EK",
     "name": "Emirates"
    }
   ]
  },
  {
   "iata": "YEG",
   "icao": "CYEG",
   "name": "Edmonton International Airport",
   "city": "Edmonton",
   "country": "Canada",
   "lon": -113.58,
   "lat": 53.3097,
   "airlines": [
    {
     "code": "AC",
     "name": "Air Canada"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "MKE",
   "icao": "KMKE",
   "name": "General Mitchell International Airport",
   "city": "Milwaukee",
   "country": "United States",
   "lon": -87.8966,
   "lat": 42.9472,
   "airlines": [
    {
     "code": "FL",
     "name": "AirTran Airways"
    },
    {
     "code": "WN",
     "name": "Southwest Airlines"
    }
   ]
  },
  {
   "iata": "YUL",
   "icao": "CYUL",
   "name": "Montreal / Pierre Elliott Trudeau International Airport",
   "city": "Montreal",
   "country": "Canada",
   "lon": -73.7408,
   "lat": 45.4706,
   "airlines": [
    {
     "code": "AC",
     "name": "Air Canada"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "MUC",
   "icao": "EDDM",
   "name": "Munich Airport",
   "city": "Munich",
   "country": "Germany",
   "lon": 11.7861,
   "lat": 48.3538,
   "airlines": [
    {
     "code": "LH",
     "name": "Lufthansa"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "EWR",
   "icao": "KEWR",
   "name": "Newark Liberty International Airport",
   "city": "Newark",
   "country": "United States",
   "lon": -74.1687,
   "lat": 40.6925,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    }
   ]
  },
  {
   "iata": "MCO",
   "icao": "KMCO",
   "name": "Orlando International Airport",
   "city": "Orlando",
   "country": "United States",
   "lon": -81.309,
   "lat": 28.4294,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    }
   ]
  },
  {
   "iata": "KIX",
   "icao": "RJBB",
   "name": "Kansai International Airport",
   "city": "Osaka",
   "country": "Japan",
   "lon": 135.244,
   "lat": 34.4273,
   "airlines": [
    {
     "code": "NH",
     "name": "All Nippon Airways"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "SLC",
   "icao": "KSLC",
   "name": "Salt Lake City International Airport",
   "city": "Salt Lake City",
   "country": "United States",
   "lon": -111.978,
   "lat": 40.7884,
   "airlines": [
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "SNA",
   "icao": "KSNA",
   "name": "John Wayne Airport-Orange County Airport",
   "city": "Santa Ana",
   "country": "United States",
   "lon": -117.868,
   "lat": 33.6757,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "WN",
     "name": "Southwest Airlines"
    }
   ]
  },
  {
   "iata": "SYD",
   "icao": "YSSY",
   "name": "Sydney Kingsford Smith International Airport",
   "city": "Sydney",
   "country": "Australia",
   "lon": 151.177,
   "lat": -33.9461,
   "airlines": [
    {
     "code": "NZ",
     "name": "Air New Zealand"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "HND",
   "icao": "RJTT",
   "name": "Tokyo Haneda International Airport",
   "city": "Tokyo",
   "country": "Japan",
   "lon": 139.78,
   "lat": 35.5523,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "JL",
     "name": "Japan Airlines"
    }
   ]
  },
  {
   "iata": "NRT",
   "icao": "RJAA",
   "name": "Narita International Airport",
   "city": "Tokyo",
   "country": "Japan",
   "lon": 140.386,
   "lat": 35.7647,
   "airlines": [
    {
     "code": "NH",
     "name": "All Nippon Airways"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "YYZ",
   "icao": "CYYZ",
   "name": "Lester B. Pearson International Airport",
   "city": "Toronto",
   "country": "Canada",
   "lon": -79.6306,
   "lat": 43.6772,
   "airlines": [
    {
     "code": "AC",
     "name": "Air Canada"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "YYJ",
   "icao": "CYYJ",
   "name": "Victoria International Airport",
   "city": "Victoria",
   "country": "Canada",
   "lon": -123.426,
   "lat": 48.6469,
   "airlines": [
    {
     "code": "AC",
     "name": "Air Canada"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "DCA",
   "icao": "KDCA",
   "name": "Ronald Reagan Washington National Airport",
   "city": "Washington",
   "country": "United States",
   "lon": -77.0377,
   "lat": 38.8521,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    }
   ]
  },
  {
   "iata": "IAD",
   "icao": "KIAD",
   "name": "Washington Dulles International Airport",
   "city": "Washington",
   "country": "United States",
   "lon": -77.4558,
   "lat": 38.9445,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "VX",
     "name": "Virgin America"
    }
   ]
  },
  {
   "iata": "ZRH",
   "icao": "LSZH",
   "name": "Zürich Airport",
   "city": "Zurich",
   "country": "Switzerland",
   "lon": 8.54917,
   "lat": 47.4647,
   "airlines": [
    {
     "code": "LX",
     "name": "Swiss International Air Lines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "ABQ",
   "icao": "KABQ",
   "name": "Albuquerque International Sunport",
   "city": "Albuquerque",
   "country": "United States",
   "lon": -106.609,
   "lat": 35.0402,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "ACV",
   "icao": "KACV",
   "name": "California Redwood Coast-Humboldt County Airport",
   "city": "Arcata CA",
   "country": "United States",
   "lon": -124.109,
   "lat": 40.9781,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "BFL",
   "icao": "KBFL",
   "name": "Meadows Field",
   "city": "Bakersfield",
   "country": "United States",
   "lon": -119.057,
   "lat": 35.4336,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "BWI",
   "icao": "KBWI",
   "name": "Baltimore/Washington International Thurgood Marshall Airport",
   "city": "Baltimore",
   "country": "United States",
   "lon": -76.6683,
   "lat": 39.1754,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "BOI",
   "icao": "KBOI",
   "name": "Boise Air Terminal/Gowen Field",
   "city": "Boise",
   "country": "United States",
   "lon": -116.223,
   "lat": 43.5644,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "BUR",
   "icao": "KBUR",
   "name": "Bob Hope Airport",
   "city": "Burbank",
   "country": "United States",
   "lon": -118.359,
   "lat": 34.2007,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "CIC",
   "icao": "KCIC",
   "name": "Chico Municipal Airport",
   "city": "Chico",
   "country": "United States",
   "lon": -121.858,
   "lat": 39.7954,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "CVG",
   "icao": "KCVG",
   "name": "Cincinnati Northern Kentucky International Airport",
   "city": "Cincinnati",
   "country": "United States",
   "lon": -84.6678,
   "lat": 39.0488,
   "airlines": [
    {
     "code": "DL",
     "name": "Delta Air Lines"
    }
   ]
  },
  {
   "iata": "CLE",
   "icao": "KCLE",
   "name": "Cleveland Hopkins International Airport",
   "city": "Cleveland",
   "country": "United States",
   "lon": -81.8498,
   "lat": 41.4117,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "COS",
   "icao": "KCOS",
   "name": "City of Colorado Springs Municipal Airport",
   "city": "Colorado Springs",
   "country": "United States",
   "lon": -104.701,
   "lat": 38.8058,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "CPH",
   "icao": "EKCH",
   "name": "Copenhagen Kastrup Airport",
   "city": "Copenhagen",
   "country": "Denmark",
   "lon": 12.656,
   "lat": 55.6179,
   "airlines": [
    {
     "code": "SK",
     "name": "Scandinavian Airlines System"
    }
   ]
  },
  {
   "iata": "CEC",
   "icao": "KCEC",
   "name": "Jack Mc Namara Field Airport",
   "city": "Crescent City",
   "country": "United States",
   "lon": -124.237,
   "lat": 41.7802,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "BJX",
   "icao": "MMLO",
   "name": "Del Bajío International Airport",
   "city": "Del Bajio",
   "country": "Mexico",
   "lon": -101.481,
   "lat": 20.9935,
   "airlines": [
    {
     "code": "AM",
     "name": "AeroMéxico"
    }
   ]
  },
  {
   "iata": "DTW",
   "icao": "KDTW",
   "name": "Detroit Metropolitan Wayne County Airport",
   "city": "Detroit",
   "country": "United States",
   "lon": -83.3534,
   "lat": 42.2124,
   "airlines": [
    {
     "code": "DL",
     "name": "Delta Air Lines"
    }
   ]
  },
  {
   "iata": "DUB",
   "icao": "EIDW",
   "name": "Dublin Airport",
   "city": "Dublin",
   "country": "Ireland",
   "lon": -6.27007,
   "lat": 53.4213,
   "airlines": [
    {
     "code": "EI",
     "name": "Aer Lingus"
    }
   ]
  },
  {
   "iata": "EUG",
   "icao": "KEUG",
   "name": "Mahlon Sweet Field",
   "city": "Eugene",
   "country": "United States",
   "lon": -123.212,
   "lat": 44.1246,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "FAT",
   "icao": "KFAT",
   "name": "Fresno Yosemite International Airport",
   "city": "Fresno",
   "country": "United States",
   "lon": -119.718,
   "lat": 36.7762,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "IAH",
   "icao": "KIAH",
   "name": "George Bush Intercontinental Houston Airport",
   "city": "Houston",
   "country": "United States",
   "lon": -95.3414,
   "lat": 29.9844,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "IND",
   "icao": "KIND",
   "name": "Indianapolis International Airport",
   "city": "Indianapolis",
   "country": "United States",
   "lon": -86.2944,
   "lat": 39.7173,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "OGG",
   "icao": "PHOG",
   "name": "Kahului Airport",
   "city": "Kahului",
   "country": "United States",
   "lon": -156.42999,
   "lat": 20.8986,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "MCI",
   "icao": "KMCI",
   "name": "Kansas City International Airport",
   "city": "Kansas City",
   "country": "United States",
   "lon": -94.7139,
   "lat": 39.2976,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "LMT",
   "icao": "KLMT",
   "name": "Crater Lake-Klamath Regional Airport",
   "city": "Klamath Falls",
   "country": "United States",
   "lon": -121.733,
   "lat": 42.1561,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "KOA",
   "icao": "PHKO",
   "name": "Ellison Onizuka Kona International At Keahole Airport",
   "city": "Kona",
   "country": "United States",
   "lon": -156.0456,
   "lat": 19.73878,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "LIH",
   "icao": "PHLI",
   "name": "Lihue Airport",
   "city": "Lihue",
   "country": "United States",
   "lon": -159.339,
   "lat": 21.976,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "LGB",
   "icao": "KLGB",
   "name": "Long Beach /Daugherty Field/ Airport",
   "city": "Long Beach",
   "country": "United States",
   "lon": -118.152,
   "lat": 33.8177,
   "airlines": [
    {
     "code": "B6",
     "name": "JetBlue Airways"
    }
   ]
  },
  {
   "iata": "MNL",
   "icao": "RPLL",
   "name": "Ninoy Aquino International Airport",
   "city": "Manila",
   "country": "Philippines",
   "lon": 121.02,
   "lat": 14.5086,
   "airlines": [
    {
     "code": "PR",
     "name": "Philippine Airlines"
    }
   ]
  },
  {
   "iata": "MFR",
   "icao": "KMFR",
   "name": "Rogue Valley International Medford Airport",
   "city": "Medford",
   "country": "United States",
   "lon": -122.873,
   "lat": 42.3742,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "MOD",
   "icao": "KMOD",
   "name": "Modesto City Co-Harry Sham Field",
   "city": "Modesto",
   "country": "United States",
   "lon": -120.954,
   "lat": 37.6258,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "MRY",
   "icao": "KMRY",
   "name": "Monterey Peninsula Airport",
   "city": "Monterey",
   "country": "United States",
   "lon": -121.843,
   "lat": 36.587,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "MLM",
   "icao": "MMMM",
   "name": "General Francisco J. Mujica International Airport",
   "city": "Morelia",
   "country": "Mexico",
   "lon": -101.025,
   "lat": 19.8499,
   "airlines": [
    {
     "code": "AM",
     "name": "AeroMéxico"
    }
   ]
  },
  {
   "iata": "MSY",
   "icao": "KMSY",
   "name": "Louis Armstrong New Orleans International Airport",
   "city": "New Orleans",
   "country": "United States",
   "lon": -90.258,
   "lat": 29.9934,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "ORF",
   "icao": "KORF",
   "name": "Norfolk International Airport",
   "city": "Norfolk",
   "country": "United States",
   "lon": -76.2012,
   "lat": 36.8946,
   "airlines": [
    {
     "code": "FL",
     "name": "AirTran Airways"
    }
   ]
  },
  {
   "iata": "OTH",
   "icao": "KOTH",
   "name": "Southwest Oregon Regional Airport",
   "city": "North Bend",
   "country": "United States",
   "lon": -124.246,
   "lat": 43.4171,
   "airlines": [
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  }
 ],
 "LFPG": [
  {
   "iata": "JFK",
   "icao": "KJFK",
   "name": "John F Kennedy International Airport",
   "city": "New York",
   "country": "United States",
   "lon": -73.7789,
   "lat": 40.6398,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AY",
     "name": "Finnair"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "BA",
     "name": "British Airways"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "EY",
     "name": "Etihad Airways"
    },
    {
     "code": "IB",
     "name": "Iberia Airlines"
    },
    {
     "code": "QR",
     "name": "Qatar Airways"
    },
    {
     "code": "SE",
     "name": "XL Airways France"
    },
    {
     "code": "US",
     "name": "US Airways"
    }
   ]
  },
  {
   "iata": "ORD",
   "icao": "KORD",
   "name": "Chicago O'Hare International Airport",
   "city": "Chicago",
   "country": "United States",
   "lon": -87.9048,
   "lat": 41.9786,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AY",
     "name": "Finnair"
    },
    {
     "code": "BA",
     "name": "British Airways"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "IB",
     "name": "Iberia Airlines"
    },
    {
     "code": "LH",
     "name": "Lufthansa"
    },
    {
     "code": "MH",
     "name": "Malaysia Airlines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    }
   ]
  },
  {
   "iata": "MIA",
   "icao": "KMIA",
   "name": "Miami International Airport",
   "city": "Miami",
   "country": "United States",
   "lon": -80.2906,
   "lat": 25.7932,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AY",
     "name": "Finnair"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "BA",
     "name": "British Airways"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "IB",
     "name": "Iberia Airlines"
    },
    {
     "code": "MH",
     "name": "Malaysia Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    }
   ]
  },
  {
   "iata": "TLS",
   "icao": "LFBO",
   "name": "Toulouse-Blagnac Airport",
   "city": "Toulouse",
   "country": "France",
   "lon": 1.36382,
   "lat": 43.6291,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AM",
     "name": "AeroMéxico"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "EY",
     "name": "Etihad Airways"
    },
    {
     "code": "JL",
     "name": "Japan Airlines"
    },
    {
     "code": "SU",
     "name": "Aeroflot Russian Airlines"
    },
    {
     "code": "U2",
     "name": "easyJet"
    }
   ]
  },
  {
   "iata": "CMN",
   "icao": "GMMN",
   "name": "Mohammed V International Airport",
   "city": "Casablanca",
   "country": "Morocco",
   "lon": -7.58997,
   "lat": 33.3675,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "KL",
     "name": "KLM Royal Dutch Airlines"
    },
    {
     "code": "L6",
     "name": "Mauritania Airlines International"
    },
    {
     "code": "SU",
     "name": "Aeroflot Russian Airlines"
    },
    {
     "code": "U2",
     "name": "easyJet"
    }
   ]
  },
  {
   "iata": "DFW",
   "icao": "KDFW",
   "name": "Dallas Fort Worth International Airport",
   "city": "Dallas-Fort Worth",
   "country": "United States",
   "lon": -97.038,
   "lat": 32.8968,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AY",
     "name": "Finnair"
    },
    {
     "code": "BA",
     "name": "British Airways"
    },
    {
     "code": "IB",
     "name": "Iberia Airlines"
    },
    {
     "code": "MH",
     "name": "Malaysia Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    }
   ]
  },
  {
   "iata": "YUL",
   "icao": "CYUL",
   "name": "Montreal / Pierre Elliott Trudeau International Airport",
   "city": "Montreal",
   "country": "Canada",
   "lon": -73.7408,
   "lat": 45.4706,
   "airlines": [
    {
     "code": "AC",
     "name": "Air Canada"
    },
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "LH",
     "name": "Lufthansa"
    },
    {
     "code": "TS",
     "name": "Air Transat"
    }
   ]
  },
  {
   "iata": "YYZ",
   "icao": "CYYZ",
   "name": "Lester B. Pearson International Airport",
   "city": "Toronto",
   "country": "Canada",
   "lon": -79.6306,
   "lat": 43.6772,
   "airlines": [
    {
     "code": "AC",
     "name": "Air Canada"
    },
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "LH",
     "name": "Lufthansa"
    },
    {
     "code": "TS",
     "name": "Air Transat"
    }
   ]
  },
  {
   "iata": "BCN",
   "icao": "LEBL",
   "name": "Barcelona International Airport",
   "city": "Barcelona",
   "country": "Spain",
   "lon": 2.07846,
   "lat": 41.2971,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "IB",
     "name": "Iberia Airlines"
    },
    {
     "code": "U2",
     "name": "easyJet"
    },
    {
     "code": "UX",
     "name": "Air Europa"
    },
    {
     "code": "VY",
     "name": "Formosa Airlines"
    }
   ]
  },
  {
   "iata": "LYS",
   "icao": "LFLL",
   "name": "Lyon Saint-Exupéry Airport",
   "city": "Lyon",
   "country": "France",
   "lon": 5.08111,
   "lat": 45.72556,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AM",
     "name": "AeroMéxico"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "JL",
     "name": "Japan Airlines"
    },
    {
     "code": "SU",
     "name": "Aeroflot Russian Airlines"
    }
   ]
  },
  {
   "iata": "PRG",
   "icao": "LKPR",
   "name": "Václav Havel Airport Prague",
   "city": "Prague",
   "country": "Czech Republic",
   "lon": 14.26,
   "lat": 50.1008,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "OK",
     "name": "Czech Airlines"
    },
    {
     "code": "QS",
     "name": "Travel Service"
    },
    {
     "code": "U2",
     "name": "easyJet"
    }
   ]
  },
  {
   "iata": "IAD",
   "icao": "KIAD",
   "name": "Washington Dulles International Airport",
   "city": "Washington",
   "country": "United States",
   "lon": -77.4558,
   "lat": 38.9445,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "LH",
     "name": "Lufthansa"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "ALG",
   "icao": "DAAG",
   "name": "Houari Boumediene Airport",
   "city": "Algier",
   "country": "Algeria",
   "lon": 3.21541,
   "lat": 36.691,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AH",
     "name": "Air Algerie"
    },
    {
     "code": "KL",
     "name": "KLM Royal Dutch Airlines"
    },
    {
     "code": "SU",
     "name": "Aeroflot Russian Airlines"
    }
   ]
  },
  {
   "iata": "ATH",
   "icao": "LGAV",
   "name": "Eleftherios Venizelos International Airport",
   "city": "Athens",
   "country": "Greece",
   "lon": 23.9445,
   "lat": 37.9364,
   "airlines": [
    {
     "code": "A3",
     "name": "Aegean Airlines"
    },
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "OA",
     "name": "Olympic Airlines"
    },
    {
     "code": "US",
     "name": "US Airways"
    }
   ]
  },
  {
   "iata": "ATL",
   "icao": "KATL",
   "name": "Hartsfield Jackson Atlanta International Airport",
   "city": "Atlanta",
   "country": "United States",
   "lon": -84.4281,
   "lat": 33.6367,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AM",
     "name": "AeroMéxico"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    }
   ]
  },
  {
   "iata": "PEK",
   "icao": "ZBAA",
   "name": "Beijing Capital International Airport",
   "city": "Beijing",
   "country": "China",
   "lon": 116.585,
   "lat": 40.0801,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "CA",
     "name": "Air China"
    },
    {
     "code": "JJ",
     "name": "TAM Brazilian Airlines"
    },
    {
     "code": "MU",
     "name": "China Eastern Airlines"
    }
   ]
  },
  {
   "iata": "CPH",
   "icao": "EKCH",
   "name": "Copenhagen Kastrup Airport",
   "city": "Copenhagen",
   "country": "Denmark",
   "lon": 12.656,
   "lat": 55.6179,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "SK",
     "name": "Scandinavian Airlines System"
    },
    {
     "code": "U2",
     "name": "easyJet"
    }
   ]
  },
  {
   "iata": "EDI",
   "icao": "EGPH",
   "name": "Edinburgh Airport",
   "city": "Edinburgh",
   "country": "United Kingdom",
   "lon": -3.3725,
   "lat": 55.95,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "BE",
     "name": "Flybe"
    },
    {
     "code": "U2",
     "name": "easyJet"
    }
   ]
  },
  {
   "iata": "LAX",
   "icao": "KLAX",
   "name": "Los Angeles International Airport",
   "city": "Los Angeles",
   "country": "United States",
   "lon": -118.408,
   "lat": 33.9425,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "TN",
     "name": "Air Tahiti Nui"
    }
   ]
  },
  {
   "iata": "MAN",
   "icao": "EGCC",
   "name": "Manchester Airport",
   "city": "Manchester",
   "country": "United Kingdom",
   "lon": -2.27495,
   "lat": 53.3537,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "BE",
     "name": "Flybe"
    },
    {
     "code": "LS",
     "name": "Jet2.com"
    }
   ]
  },
  {
   "iata": "EWR",
   "icao": "KEWR",
   "name": "Newark Liberty International Airport",
   "city": "Newark",
   "country": "United States",
   "lon": -74.1687,
   "lat": 40.6925,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "LH",
     "name": "Lufthansa"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "PMO",
   "icao": "LICJ",
   "name": "Falcone–Borsellino Airport",
   "city": "Palermo",
   "country": "Italy",
   "lon": 13.091,
   "lat": 38.176,
   "airlines": [
    {
     "code": "AP",
     "name": "Air One"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "IG",
     "name": "Meridiana"
    },
    {
     "code": "SE",
     "name": "XL Airways France"
    }
   ]
  },
  {
   "iata": "PHL",
   "icao": "KPHL",
   "name": "Philadelphia International Airport",
   "city": "Philadelphia",
   "country": "United States",
   "lon": -75.2411,
   "lat": 39.8719,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "US",
     "name": "US Airways"
    }
   ]
  },
  {
   "iata": "PUJ",
   "icao": "MDPC",
   "name": "Punta Cana International Airport",
   "city": "Punta Cana",
   "country": "Dominican Republic",
   "lon": -68.3634,
   "lat": 18.5674,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "KL",
     "name": "KLM Royal Dutch Airlines"
    },
    {
     "code": "SE",
     "name": "XL Airways France"
    }
   ]
  },
  {
   "iata": "SFO",
   "icao": "KSFO",
   "name": "San Francisco International Airport",
   "city": "San Francisco",
   "country": "United States",
   "lon": -122.375,
   "lat": 37.619,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "UA",
     "name": "United Airlines"
    }
   ]
  },
  {
   "iata": "VIE",
   "icao": "LOWW",
   "name": "Vienna International Airport",
   "city": "Vienna",
   "country": "Austria",
   "lon": 16.5697,
   "lat": 48.1103,
   "airlines": [
    {
     "code": "AB",
     "name": "Air Berlin"
    },
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "HG",
     "name": "Niki"
    },
    {
     "code": "OS",
     "name": "Austrian Airlines"
    }
   ]
  },
  {
   "iata": "ABZ",
   "icao": "EGPD",
   "name": "Aberdeen Dyce Airport",
   "city": "Aberdeen",
   "country": "United Kingdom",
   "lon": -2.19778,
   "lat": 57.2019,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "BE",
     "name": "Flybe"
    }
   ]
  },
  {
   "iata": "ABV",
   "icao": "DNAA",
   "name": "Nnamdi Azikiwe International Airport",
   "city": "Abuja",
   "country": "Nigeria",
   "lon": 7.26317,
   "lat": 9.00679,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "KL",
     "name": "KLM Royal Dutch Airlines"
    }
   ]
  },
  {
   "iata": "AMS",
   "icao": "EHAM",
   "name": "Amsterdam Airport Schiphol",
   "city": "Amsterdam",
   "country": "Netherlands",
   "lon": 4.76389,
   "lat": 52.3086,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "KL",
     "name": "KLM Royal Dutch Airlines"
    },
    {
     "code": "MU",
     "name": "China Eastern Airlines"
    }
   ]
  },
  {
   "iata": "BKK",
   "icao": "VTBS",
   "name": "Suvarnabhumi Airport",
   "city": "Bangkok",
   "country": "Thailand",
   "lon": 100.747,
   "lat": 13.6811,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "TG",
     "name": "Thai Airways International"
    }
   ]
  },
  {
   "iata": "TXL",
   "icao": "EDDT",
   "name": "Berlin-Tegel Airport",
   "city": "Berlin",
   "country": "Germany",
   "lon": 13.2877,
   "lat": 52.5597,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "LH",
     "name": "Lufthansa"
    }
   ]
  },
  {
   "iata": "BIO",
   "icao": "LEBB",
   "name": "Bilbao Airport",
   "city": "Bilbao",
   "country": "Spain",
   "lon": -2.91061,
   "lat": 43.3011,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "UX",
     "name": "Air Europa"
    }
   ]
  },
  {
   "iata": "BLQ",
   "icao": "LIPE",
   "name": "Bologna Guglielmo Marconi Airport",
   "city": "Bologna",
   "country": "Italy",
   "lon": 11.2887,
   "lat": 44.5354,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "U2",
     "name": "easyJet"
    }
   ]
  },
  {
   "iata": "BOS",
   "icao": "KBOS",
   "name": "General Edward Lawrence Logan International Airport",
   "city": "Boston",
   "country": "United States",
   "lon": -71.0052,
   "lat": 42.3643,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    }
   ]
  },
  {
   "iata": "CAI",
   "icao": "HECA",
   "name": "Cairo International Airport",
   "city": "Cairo",
   "country": "Egypt",
   "lon": 31.4056,
   "lat": 30.1219,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "IY",
     "name": "Yemenia"
    },
    {
     "code": "MS",
     "name": "Egyptair"
    }
   ]
  },
  {
   "iata": "CTA",
   "icao": "LICC",
   "name": "Catania-Fontanarossa Airport",
   "city": "Catania",
   "country": "Italy",
   "lon": 15.0664,
   "lat": 37.4668,
   "airlines": [
    {
     "code": "AP",
     "name": "Air One"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "U2",
     "name": "easyJet"
    }
   ]
  },
  {
   "iata": "DTW",
   "icao": "KDTW",
   "name": "Detroit Metropolitan Wayne County Airport",
   "city": "Detroit",
   "country": "United States",
   "lon": -83.3534,
   "lat": 42.2124,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    }
   ]
  },
  {
   "iata": "DXB",
   "icao": "OMDB",
   "name": "Dubai International Airport",
   "city": "Dubai",
   "country": "United Arab Emirates",
   "lon": 55.3644,
   "lat": 25.2528,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "EK",
     "name": "Emirates"
    }
   ]
  },
  {
   "iata": "DUB",
   "icao": "EIDW",
   "name": "Dublin Airport",
   "city": "Dublin",
   "country": "Ireland",
   "lon": -6.27007,
   "lat": 53.4213,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "EI",
     "name": "Aer Lingus"
    }
   ]
  },
  {
   "iata": "DUS",
   "icao": "EDDL",
   "name": "Düsseldorf Airport",
   "city": "Duesseldorf",
   "country": "Germany",
   "lon": 6.76678,
   "lat": 51.2895,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "LH",
     "name": "Lufthansa"
    }
   ]
  },
  {
   "iata": "GOT",
   "icao": "ESGG",
   "name": "Gothenburg-Landvetter Airport",
   "city": "Gothenborg",
   "country": "Sweden",
   "lon": 12.2798,
   "lat": 57.6628,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "UX",
     "name": "Air Europa"
    }
   ]
  },
  {
   "iata": "HAM",
   "icao": "EDDH",
   "name": "Hamburg Airport",
   "city": "Hamburg",
   "country": "Germany",
   "lon": 9.98823,
   "lat": 53.6304,
   "airlines": [
    {
     "code": "4U",
     "name": "Germanwings"
    },
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    }
   ]
  },
  {
   "iata": "HAN",
   "icao": "VVNB",
   "name": "Noi Bai International Airport",
   "city": "Hanoi",
   "country": "Vietnam",
   "lon": 105.807,
   "lat": 21.2212,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "VN",
     "name": "Vietnam Airlines"
    }
   ]
  },
  {
   "iata": "HEL",
   "icao": "EFHK",
   "name": "Helsinki Vantaa Airport",
   "city": "Helsinki",
   "country": "Finland",
   "lon": 24.9633,
   "lat": 60.3172,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AY",
     "name": "Finnair"
    },
    {
     "code": "MH",
     "name": "Malaysia Airlines"
    }
   ]
  },
  {
   "iata": "SGN",
   "icao": "VVTS",
   "name": "Tan Son Nhat International Airport",
   "city": "Ho Chi Minh City",
   "country": "Vietnam",
   "lon": 106.652,
   "lat": 10.8188,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "VN",
     "name": "Vietnam Airlines"
    }
   ]
  },
  {
   "iata": "HKG",
   "icao": "VHHH",
   "name": "Hong Kong International Airport",
   "city": "Hong Kong",
   "country": "Hong Kong",
   "lon": 113.915,
   "lat": 22.3089,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "CX",
     "name": "Cathay Pacific"
    }
   ]
  },
  {
   "iata": "IAH",
   "icao": "KIAH",
   "name": "George Bush Intercontinental Houston Airport",
   "city": "Houston",
   "country": "United States",
   "lon": -95.3414,
   "lat": 29.9844,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    }
   ]
  },
  {
   "iata": "IST",
   "icao": "LTFM",
   "name": "Istanbul Airport",
   "city": "Istanbul",
   "country": "Turkey",
   "lon": 28.75194,
   "lat": 41.27528,
   "airlines": [
    {
     "code": "8Q",
     "name": "Onur Air"
    },
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "TK",
     "name": "Turkish Airlines"
    }
   ]
  },
  {
   "iata": "KEF",
   "icao": "BIKF",
   "name": "Keflavik International Airport",
   "city": "Keflavik",
   "country": "Iceland",
   "lon": -22.6056,
   "lat": 63.985,
   "airlines": [
    {
     "code": "FI",
     "name": "Icelandair"
    },
    {
     "code": "W2",
     "name": "Maastricht Airlines"
    },
    {
     "code": "WW",
     "name": "bmibaby"
    }
   ]
  },
  {
   "iata": "KUL",
   "icao": "WMKK",
   "name": "Kuala Lumpur International Airport",
   "city": "Kuala Lumpur",
   "country": "Malaysia",
   "lon": 101.71,
   "lat": 2.74558,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "MH",
     "name": "Malaysia Airlines"
    }
   ]
  },
  {
   "iata": "LIS",
   "icao": "LPPT",
   "name": "Humberto Delgado Airport (Lisbon Portela Airport)",
   "city": "Lisbon",
   "country": "Portugal",
   "lon": -9.13592,
   "lat": 38.7813,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "U2",
     "name": "easyJet"
    }
   ]
  },
  {
   "iata": "LHR",
   "icao": "EGLL",
   "name": "London Heathrow Airport",
   "city": "London",
   "country": "United Kingdom",
   "lon": -0.46194,
   "lat": 51.4706,
   "airlines": [
    {
     "code": "AA",
     "name": "American Airlines"
    },
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "BA",
     "name": "British Airways"
    }
   ]
  },
  {
   "iata": "MAD",
   "icao": "LEMD",
   "name": "Adolfo Suárez Madrid–Barajas Airport",
   "city": "Madrid",
   "country": "Spain",
   "lon": -3.56264,
   "lat": 40.47193,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "U2",
     "name": "easyJet"
    },
    {
     "code": "VY",
     "name": "Formosa Airlines"
    }
   ]
  },
  {
   "iata": "AGP",
   "icao": "LEMG",
   "name": "Málaga Airport",
   "city": "Malaga",
   "country": "Spain",
   "lon": -4.49911,
   "lat": 36.6749,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "U2",
     "name": "easyJet"
    },
    {
     "code": "UX",
     "name": "Air Europa"
    }
   ]
  },
  {
   "iata": "MRS",
   "icao": "LFML",
   "name": "Marseille Provence Airport",
   "city": "Marseille",
   "country": "France",
   "lon": 5.22142,
   "lat": 43.43927,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "SE",
     "name": "XL Airways France"
    }
   ]
  },
  {
   "iata": "MEX",
   "icao": "MMMX",
   "name": "Licenciado Benito Juarez International Airport",
   "city": "Mexico City",
   "country": "Mexico",
   "lon": -99.0721,
   "lat": 19.4363,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AM",
     "name": "AeroMéxico"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    }
   ]
  },
  {
   "iata": "LIN",
   "icao": "LIML",
   "name": "Milano Linate Airport",
   "city": "Milan",
   "country": "Italy",
   "lon": 9.27674,
   "lat": 45.4451,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AP",
     "name": "Air One"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    }
   ]
  },
  {
   "iata": "BSL",
   "icao": "LFSB",
   "name": "EuroAirport Basel-Mulhouse-Freiburg Airport",
   "city": "Mulhouse",
   "country": "France",
   "lon": 7.52917,
   "lat": 47.59,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "KL",
     "name": "KLM Royal Dutch Airlines"
    },
    {
     "code": "MK",
     "name": "Air Mauritius"
    }
   ]
  },
  {
   "iata": "NAP",
   "icao": "LIRN",
   "name": "Naples International Airport",
   "city": "Naples",
   "country": "Italy",
   "lon": 14.2908,
   "lat": 40.886,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "U2",
     "name": "easyJet"
    }
   ]
  },
  {
   "iata": "NCL",
   "icao": "EGNT",
   "name": "Newcastle Airport",
   "city": "Newcastle",
   "country": "United Kingdom",
   "lon": -1.69167,
   "lat": 55.0375,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "BE",
     "name": "Flybe"
    }
   ]
  },
  {
   "iata": "NIM",
   "icao": "DRRN",
   "name": "Diori Hamani International Airport",
   "city": "Niamey",
   "country": "Niger",
   "lon": 2.18361,
   "lat": 13.4815,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    },
    {
     "code": "KL",
     "name": "KLM Royal Dutch Airlines"
    }
   ]
  },
  {
   "iata": "OSL",
   "icao": "ENGM",
   "name": "Oslo Lufthavn",
   "city": "Oslo",
   "country": "Norway",
   "lon": 11.0502,
   "lat": 60.121,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "SK",
     "name": "Scandinavian Airlines System"
    }
   ]
  },
  {
   "iata": "FCO",
   "icao": "LIRF",
   "name": "Leonardo da Vinci–Fiumicino Airport",
   "city": "Rome",
   "country": "Italy",
   "lon": 12.23889,
   "lat": 41.80028,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "KU",
     "name": "Kuwait Airways"
    }
   ]
  },
  {
   "iata": "SEA",
   "icao": "KSEA",
   "name": "Seattle Tacoma International Airport",
   "city": "Seattle",
   "country": "United States",
   "lon": -122.309,
   "lat": 47.449,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "DL",
     "name": "Delta Air Lines"
    }
   ]
  },
  {
   "iata": "ICN",
   "icao": "RKSI",
   "name": "Incheon International Airport",
   "city": "Seoul",
   "country": "South Korea",
   "lon": 126.451,
   "lat": 37.4691,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "KE",
     "name": "Korean Air"
    },
    {
     "code": "OZ",
     "name": "Asiana Airlines"
    }
   ]
  },
  {
   "iata": "PVG",
   "icao": "ZSPD",
   "name": "Shanghai Pudong International Airport",
   "city": "Shanghai",
   "country": "China",
   "lon": 121.805,
   "lat": 31.1434,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "CA",
     "name": "Air China"
    },
    {
     "code": "MU",
     "name": "China Eastern Airlines"
    }
   ]
  },
  {
   "iata": "ARN",
   "icao": "ESSA",
   "name": "Stockholm-Arlanda Airport",
   "city": "Stockholm",
   "country": "Sweden",
   "lon": 17.9186,
   "lat": 59.6519,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "SK",
     "name": "Scandinavian Airlines System"
    }
   ]
  },
  {
   "iata": "TLV",
   "icao": "LLBG",
   "name": "Ben Gurion International Airport",
   "city": "Tel-aviv",
   "country": "Israel",
   "lon": 34.8867,
   "lat": 32.0114,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "IZ",
     "name": "Arkia Israel Airlines"
    },
    {
     "code": "LY",
     "name": "El Al Israel Airlines"
    }
   ]
  },
  {
   "iata": "HND",
   "icao": "RJTT",
   "name": "Tokyo Haneda International Airport",
   "city": "Tokyo",
   "country": "Japan",
   "lon": 139.78,
   "lat": 35.5523,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "JL",
     "name": "Japan Airlines"
    },
    {
     "code": "NH",
     "name": "All Nippon Airways"
    }
   ]
  },
  {
   "iata": "NRT",
   "icao": "RJAA",
   "name": "Narita International Airport",
   "city": "Tokyo",
   "country": "Japan",
   "lon": 140.386,
   "lat": 35.7647,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "JL",
     "name": "Japan Airlines"
    },
    {
     "code": "NH",
     "name": "All Nippon Airways"
    }
   ]
  },
  {
   "iata": "TUN",
   "icao": "DTTA",
   "name": "Tunis Carthage International Airport",
   "city": "Tunis",
   "country": "Tunisia",
   "lon": 10.2272,
   "lat": 36.851,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "BJ",
     "name": "Nouvel Air Tunisie"
    },
    {
     "code": "FS",
     "name": "Servicios de Transportes A"
    }
   ]
  },
  {
   "iata": "VCE",
   "icao": "LIPZ",
   "name": "Venice Marco Polo Airport",
   "city": "Venice",
   "country": "Italy",
   "lon": 12.3519,
   "lat": 45.5053,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "U2",
     "name": "easyJet"
    }
   ]
  },
  {
   "iata": "VGO",
   "icao": "LEVX",
   "name": "Vigo Airport",
   "city": "Vigo",
   "country": "Spain",
   "lon": -8.62677,
   "lat": 42.2318,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "UX",
     "name": "Air Europa"
    }
   ]
  },
  {
   "iata": "EVN",
   "icao": "UDYZ",
   "name": "Zvartnots International Airport",
   "city": "Yerevan",
   "country": "Armenia",
   "lon": 44.3959,
   "lat": 40.1473,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    },
    {
     "code": "QN",
     "name": "QN"
    }
   ]
  },
  {
   "iata": "ABJ",
   "icao": "DIAP",
   "name": "Port Bouet Airport",
   "city": "Abidjan",
   "country": "Cote d'Ivoire",
   "lon": -3.92629,
   "lat": 5.26139,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    }
   ]
  },
  {
   "iata": "AUH",
   "icao": "OMAA",
   "name": "Abu Dhabi International Airport",
   "city": "Abu Dhabi",
   "country": "United Arab Emirates",
   "lon": 54.6511,
   "lat": 24.433,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "EY",
     "name": "Etihad Airways"
    }
   ]
  },
  {
   "iata": "AMM",
   "icao": "OJAI",
   "name": "Queen Alia International Airport",
   "city": "Amman",
   "country": "Jordan",
   "lon": 35.9932,
   "lat": 31.7226,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "RJ",
     "name": "Royal Jordanian"
    }
   ]
  },
  {
   "iata": "TNR",
   "icao": "FMMI",
   "name": "Ivato Airport",
   "city": "Antananarivo",
   "country": "Madagascar",
   "lon": 47.4788,
   "lat": -18.7969,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "MD",
     "name": "Air Madagascar"
    }
   ]
  },
  {
   "iata": "OVD",
   "icao": "LEAS",
   "name": "Asturias Airport",
   "city": "Aviles",
   "country": "Spain",
   "lon": -6.03462,
   "lat": 43.5636,
   "airlines": [
    {
     "code": "IB",
     "name": "Iberia Airlines"
    },
    {
     "code": "VY",
     "name": "Formosa Airlines"
    }
   ]
  },
  {
   "iata": "GYD",
   "icao": "UBBB",
   "name": "Heydar Aliyev International Airport",
   "city": "Baku",
   "country": "Azerbaijan",
   "lon": 50.0467,
   "lat": 40.4675,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "J2",
     "name": "Azerbaijan Airlines"
    }
   ]
  },
  {
   "iata": "BEY",
   "icao": "OLBA",
   "name": "Beirut Rafic Hariri International Airport",
   "city": "Beirut",
   "country": "Lebanon",
   "lon": 35.4884,
   "lat": 33.8209,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "ME",
     "name": "Middle East Airlines"
    }
   ]
  },
  {
   "iata": "BEG",
   "icao": "LYBE",
   "name": "Belgrade Nikola Tesla Airport",
   "city": "Belgrade",
   "country": "Serbia",
   "lon": 20.3091,
   "lat": 44.8184,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "JU",
     "name": "Air Serbia"
    }
   ]
  },
  {
   "iata": "BLL",
   "icao": "EKBI",
   "name": "Billund Airport",
   "city": "Billund",
   "country": "Denmark",
   "lon": 9.15178,
   "lat": 55.7403,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    }
   ]
  },
  {
   "iata": "BHX",
   "icao": "EGBB",
   "name": "Birmingham International Airport",
   "city": "Birmingham",
   "country": "United Kingdom",
   "lon": -1.74803,
   "lat": 52.4539,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "BE",
     "name": "Flybe"
    }
   ]
  },
  {
   "iata": "BOD",
   "icao": "LFBD",
   "name": "Bordeaux-Mérignac Airport",
   "city": "Bordeaux",
   "country": "France",
   "lon": -0.71556,
   "lat": 44.8283,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    }
   ]
  },
  {
   "iata": "BZV",
   "icao": "FCBB",
   "name": "Maya-Maya Airport",
   "city": "Brazzaville",
   "country": "Congo (Brazzaville)",
   "lon": 15.253,
   "lat": -4.2517,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "LC",
     "name": "Varig Log"
    }
   ]
  },
  {
   "iata": "BRE",
   "icao": "EDDW",
   "name": "Bremen Airport",
   "city": "Bremen",
   "country": "Germany",
   "lon": 8.78667,
   "lat": 53.0475,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    }
   ]
  },
  {
   "iata": "BES",
   "icao": "LFRB",
   "name": "Brest Bretagne Airport",
   "city": "Brest",
   "country": "France",
   "lon": -4.41854,
   "lat": 48.4479,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "AZ",
     "name": "Alitalia"
    }
   ]
  },
  {
   "iata": "BRU",
   "icao": "EBBR",
   "name": "Brussels Airport",
   "city": "Brussels",
   "country": "Belgium",
   "lon": 4.48444,
   "lat": 50.9014,
   "airlines": [
    {
     "code": "ET",
     "name": "Ethiopian Airlines"
    },
    {
     "code": "SN",
     "name": "Brussels Airlines"
    }
   ]
  },
  {
   "iata": "OTP",
   "icao": "LROP",
   "name": "Henri Coandă International Airport",
   "city": "Bucharest",
   "country": "Romania",
   "lon": 26.085,
   "lat": 44.57111,
   "airlines": [
    {
     "code": "AF",
     "name": "Air France"
    },
    {
     "code": "RO",
     "name": "Tarom"
    }
   ]
  }
 ]
};
