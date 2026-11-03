# toast&tide · order online

Ordering site for Toast & Tide, the healthy breakfast spot in Soma Bay on the Red Sea. No toast left behind.

- Menu tabs for the toast bar, the gf oven, the low tide yogurt bar, drinks and smoothies
- Build-your-own toast, yogurt bowl and superfood smoothie, with live prices
- Tray, checkout (pick up or table delivery) and order confirmation

`index.html` is the whole site: one self-contained file with no dependencies besides Google Fonts.

## Before going live

- Menu items and prices are samples. Replace them in `src/Main.dc.html` (the `TT_MENU` and builder lists).
- Fill in `[YOUR HOURS]`, `[YOUR PHONE / WHATSAPP]` and `[YOUR PAYMENT OPTIONS]`.
- Orders are not sent anywhere yet. Connect an ordering backend or service to receive them.

## Rebuilding

The design source is `src/Main.dc.html`. After editing it, rebuild `index.html` from the repo root:

```
python3 tools/build.py src/Main.dc.html
```
