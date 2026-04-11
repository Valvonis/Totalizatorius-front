/** Lithuanian country names -> ISO 3166-1 alpha-2 codes for react-flagkit */
const countries: Record<string, string> = {
  Albanija: "AL",
  Anglija: "GB",
  Austrija: "AT",
  Belgija: "BE",
  "Bosnija ir Hercegovina": "BA",
  Brazilija: "BR",
  Bulgarija: "BG",
  Čekija: "CZ",
  Danija: "DK",
  Egiptas: "EG",
  Estija: "EE",
  Graikija: "GR",
  Gruzija: "GE",
  Ispanija: "ES",
  Islandija: "IS",
  Italija: "IT",
  Japonija: "JP",
  Juodkalnija: "ME",
  Kolumbija: "CO",
  Kostarika: "CR",
  Kroatija: "HR",
  Latvija: "LV",
  Lenkija: "PL",
  Lietuva: "LT",
  Meksika: "MX",
  Nyderlandai: "NL",
  Norvegija: "NO",
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
  Argentina: "AR",
  Urugvajus: "UY",
  Peru: "PE",
  Čilė: "CL",
};

export function getCountryCode(name: string): string | undefined {
  return countries[name];
}

export function getCountryNames(): string[] {
  return Object.keys(countries).sort();
}

export default countries;
