# Card energie casă (Energy house card)

Română · [English](README.md)

[![HACS custom](https://img.shields.io/badge/HACS-Custom-orange.svg?style=flat-square)](https://hacs.xyz/docs/faq/custom_repositories/) [![release](https://img.shields.io/github/v/release/AdrianTIonut/ha-energy-house-card?style=flat-square)](https://github.com/AdrianTIonut/ha-energy-house-card/releases) ![downloads](https://img.shields.io/github/downloads/AdrianTIonut/ha-energy-house-card/total?style=flat-square) [![build](https://img.shields.io/github/actions/workflow/status/AdrianTIonut/ha-energy-house-card/ci.yml?branch=main&style=flat-square)](https://github.com/AdrianTIonut/ha-energy-house-card/actions) ![license](https://img.shields.io/github/license/AdrianTIonut/ha-energy-house-card?style=flat-square)

Card pentru [Home Assistant](https://www.home-assistant.io/), pentru o casă cu **solar, rețea și baterie**: diagramă de flux, statistici zilnice, autonomia bateriei (cu rezerva și pragul de oprire ale invertorului, plus autonomia de backup când pică rețeaua), consumatori, grafic 24 h / 7 zile și prețuri editabile. Fluxul e **animat**: panglicile strălucesc, iar punctele și săgețile curg pe ele în sensul energiei (se opresc la „reduce motion”). Un singur fișier JavaScript, fără dependențe, fără rețea. Se configurează **din interfața Home Assistant** (editor vizual cu detectare automată a senzorilor), fără YAML.

<p>
<img src="docs/img/full.png" width="400" alt="cardul complet">
<img src="docs/img/compact-animated.png" width="400" alt="flux compact și statistici, animat: punctele și săgețile curg pe panglici">
</p>

> **Atenție (prima versiune publică, 0.1.0).** Cardul a fost făcut pentru o tabletă de perete din România: textul de pe card e în română, iar prețurile sunt în *lei/kWh*. Editorul e în engleză și română. Traducerea cardului în sine urmează. Dacă nu setezi entitățile, cardul caută numele implicite ale autorului (pentru un invertor Deye), deci **setează-ți mereu entitățile** sau apasă *Detectează automat senzorii* în editor.

## Instalare

- **Marketplace / HACS (repository personalizat):** Setări → Marketplace → **Add from link** → `https://github.com/AdrianTIonut/ha-energy-house-card`, tip **Dashboard**; apoi reîncarci browserul.
- **Manual:** copiezi `ha-energy-house-card.js` din [ultimul release](https://github.com/AdrianTIonut/ha-energy-house-card/releases/latest) în `config/www/energy-house-card/` și adaugi resursa `/local/energy-house-card/ha-energy-house-card.js?v=1` (tip **Modul JavaScript**).

### Actualizare

Instalezi actualizarea din Marketplace / HACS și reîncarci browserul. În aplicația de telefon: Setări → Companion app → Depanare → *Reset frontend cache* (sau închizi aplicația complet și o deschizi din nou). La instalarea manuală: înlocuiești fișierul și schimbi numărul din `?v=` al resursei.

## Configurare din interfață

**Adaugă card → Energy house card**: editorul are blocuri pentru ce se afișează, senzori de putere, consumatori, baterie, energie zilnică, prețuri și aspect. *Detectează automat senzorii* completează senzorii de solar, rețea, nivel și capacitate bateriei, după unitate și nume. Verifică semnele în previzualizare: dacă contorul tău e **+ la export**, bifează *Contorul e + la export*.

În YAML (același card):

```yaml
type: custom:energy-house-card
sections: [compact, compact_stats]      # coloană îngustă: flux compact + statistici
pv_entity: sensor.solar_power
grid_entity: sensor.contor_retea        # un contor cu semn (+ = import); sau import_entity + export_entity
charge_entity: sensor.baterie_incarcare
discharge_entity: sensor.baterie_descarcare
soc_entity: sensor.baterie_nivel
battery_capacity_kwh: 10
battery_reserve_pct: 20                 # păstrat pentru pană de curent
battery_shutdown_pct: 10                # aici se oprește invertorul
consumers:
  - { name: Piscină, power: sensor.piscina_putere, icon: mdi:pool }
```

Ce nu e măsurat de un consumator rămâne la **Casă**: cardul îl calculează din producție, rețea și baterie.

## Secțiuni

`sections` alege blocurile și ordinea lor; fără el apare tot cardul: `header` (antet), `tiles` (plăcuțe), `graph`, `flow`, `consumers`, `battery`, `inverters`, `stats`, `prices`, `compact` (flux mic pentru coloane de ~340 px), `compact_stats`.

<p>
<img src="docs/img/header.png" width="400" alt="antet">
<img src="docs/img/battery.png" width="400" alt="baterie">
</p>

## Opțiuni

Lista completă de opțiuni (senzori de putere, baterie, energie zilnică, prețuri, consumatori, aspect) e în [README-ul în engleză](README.md#configuration-reference); numele cheilor sunt aceleași.

## Depanare

- **„Custom element doesn't exist: energy-house-card”**: resursa nu e încărcată. Verifică Setări → Dashboard-uri → ⋮ → Resurse (tip *Modul JavaScript*), apoi reîmprospătare forțată (Ctrl+F5).
- **Valorile arată „—”, sau cardul arată nume pe care nu le ai**: entitățile nu sunt setate. Apasă *Detectează automat senzorii* în editor sau setează-le manual (Instrumente pentru dezvoltatori → Stări are id-urile exacte).
- **Importul și exportul par inversate**: bifează *Contorul e + la export* (`grid_invert: true`) sau folosește `import_entity` și `export_entity`.
- **Autonomia arată „—”**: are nevoie de nivelul bateriei (`soc_entity`), de capacitate și de consumul casei.
- **Casetele de preț nu fac nimic**: `tarif_entity` și `pret_export_entity` trebuie să fie ajutoare `input_number`.
- **Textele sunt în română**: cardul în sine nu e încă tradus (vezi nota de la început); editorul e în engleză și română.
- **O opțiune nouă nu face nimic după o actualizare**: schimbă numărul `?v=` din resursă și reîmprospătează forțat.

## Dezvoltare

```bash
node build.js            # produce energie-casa-card.js și ha-energy-house-card.js din src/
node tests/run-all.mjs   # toate testele
node docs/demo/capture.mjs   # regenerează docs/img din demo-ul cu date inventate (cere Chrome)
```

Licență: MIT.
