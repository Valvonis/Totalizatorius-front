/** Lithuanian country names -> ISO 3166-1 alpha-2 codes for react-flagkit */
const countries: Record<string, string> = {
  // UEFA
  Albanija: "AL",
  Anglija: "GB-ENG",
  Austrija: "AT",
  Belgija: "BE",
  "Bosnija ir Hercegovina": "BA",
  Bulgarija: "BG",
  Čekija: "CZ",
  Danija: "DK",
  Estija: "EE",
  Graikija: "GR",
  Gruzija: "GE",
  Ispanija: "ES",
  Islandija: "IS",
  Italija: "IT",
  Juodkalnija: "ME",
  Kroatija: "HR",
  Latvija: "LV",
  Lenkija: "PL",
  Lietuva: "LT",
  Norvegija: "NO",
  Olandija: "NL",
  Portugalija: "PT",
  Prancūzija: "FR",
  Rumunija: "RO",
  Rusija: "RU",
  Sakartvelas: "GE",
  Serbija: "RS",
  Slovakija: "SK",
  Slovėnija: "SI",
  Suomija: "FI",
  Škotija: "GB-SCT",
  Šveicarija: "CH",
  Švedija: "SE",
  Turkija: "TR",
  Ukraina: "UA",
  Vengrija: "HU",
  Vokietija: "DE",
  Airija: "IE",
  // CONMEBOL
  Argentina: "AR",
  Brazilija: "BR",
  Čilė: "CL",
  Ekvadoras: "EC",
  Kolumbija: "CO",
  Paragvajus: "PY",
  Peru: "PE",
  Urugvajus: "UY",
  // AFC
  Australija: "AU",
  Iranas: "IR",
  Irakas: "IQ",
  Japonija: "JP",
  Jordanija: "JO",
  Kataras: "QA",
  "Pietų Korėja": "KR",
  "Saudo Arabija": "SA",
  Uzbekistanas: "UZ",
  // CAF
  Alžyras: "DZ",
  Egiptas: "EG",
  Gana: "GH",
  "Dramblio Kaulo Krantas": "CI",
  "Kabo Verdė": "CV",
  "Kongo DR": "CD",
  Marokas: "MA",
  Senegalas: "SN",
  "Pietų Afrika": "ZA",
  Tunisas: "TN",
  // CONCACAF
  Haitis: "HT",
  Kanada: "CA",
  Kiurasao: "CW",
  Meksika: "MX",
  Panama: "PA",
  JAV: "US",
  // OFC
  "Naujoji Zelandija": "NZ",
  // Other
  Kostarika: "CR",
};

export function getCountryCode(name: string): string | undefined {
  return countries[name];
}

export function getCountryNames(): string[] {
  return Object.keys(countries).sort();
}

export default countries;
