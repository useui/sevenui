# SevenUI — Base UI Tabanlı shadcn Registry Tasarımı

**Tarih:** 2026-09-02
**Durum:** Onaylandı (tasarım bölümleri sohbette tek tek onaylandı)
**Kapsam dışı:** Blocks/templates ve ücretli satış (sonraki faz), Radix ve React Aria varyantları (v2)

## Özet

SevenUI, yalnızca [Base UI](https://base-ui.com) (`@base-ui-components/react`) primitive'leri üzerine kurulmuş, shadcn registry protokolüyle dağıtılan bir React component kütüphanesidir. ReUI'ın modelini izler: kullanıcı componentleri npm paketi olarak değil, `npx shadcn add` ile kaynak kodu olarak projesine kopyalar. Docs sitesi ve registry tek repodan, sevenui.dev üzerinden yayınlanır.

## Temel Kararlar

| Karar | Seçim | Gerekçe |
|---|---|---|
| Primitive kütüphanesi | Yalnızca Base UI (v1) | Tek bağımlılık, tutarlı API; Radix/Aria varyantları v2'de |
| Görsel kimlik | shadcn-uyumlu drop-in | Aynı CSS değişkenleri (`--primary`, `--radius`...); mevcut shadcn projelerinin temasına otomatik uyum |
| Kapsam | Tam shadcn paritesi (~50 item) | "shadcn yerine kullan" iddiası eksiksiz set gerektirir |
| Docs framework'ü | Blume (Astro + Vite tabanlı) | `Component` canlı önizleme özelliği, `examples.css` token kancası, hazır arama/llms.txt/SEO |
| Repo yapısı | Düz tek paket (monorepo değil) | YAGNI; blocks fazında taşınır |
| Domain | sevenui.dev | Registry URL'leri baştan sabit |

## Mimari

### Dizin Yapısı

```
sevenui/
├── registry/base/ui/       # component kaynakları: button.tsx, dialog.tsx...
├── registry/base/lib/      # yardımcılar (cn vb.)
├── examples/               # demo dosyaları (component başına klasör)
│   └── button/
│       ├── button-demo.tsx
│       └── button-variants.tsx
├── docs/                   # Blume MDX içeriği
│   ├── index.mdx
│   ├── installation.mdx
│   ├── theming.mdx
│   └── components/*.mdx    # component başına 1 sayfa
├── registry.json           # shadcn registry tanımı
├── blume.config.ts
└── public/r/               # `shadcn build` çıktısı (statik JSON)
```

`registry/base/` klasörlemesi çok-flavor hazırlığıdır: v2'de `registry/radix/`, `registry/aria/` ve `/r/radix/{name}.json` yolları eklenir; v1 URL'leri hiç kırılmaz.

### Kullanıcı Akışı

```bash
# components.json'a bir kez:
"registries": { "@sevenui": "https://sevenui.dev/r/{name}.json" }

# sonra:
npx shadcn@latest add @sevenui/button
# veya doğrudan:
npx shadcn@latest add https://sevenui.dev/r/button.json
```

### Registry Item Türleri

- `registry:ui` — componentler
- `registry:lib` — `cn` gibi yardımcılar
- `registry:example` — examples/ altındaki demo dosyaları (docs önizlemeleriyle aynı kaynak)
- Tema item'ı — shadcn-uyumlu CSS değişken seti; kullanıcının mevcut değişkenlerini ezmez

### Bağımlılık Politikası

Her component yalnızca şunları kullanabilir: `@base-ui-components/react`, Tailwind v4, `class-variance-authority` / `clsx` / `tailwind-merge`. Radix ve react-aria v1'de hiçbir bağımlılıkta görünmez. İstisnalar (Bölüm: Üçüncü Parti) tek tek listelenmiştir ve hepsi Radix-free'dir.

## Component Kapsamı (~50 item)

### Base UI primitive'iyle birebir (28)

accordion, alert-dialog, avatar, checkbox, collapsible, combobox, context-menu, dialog, dropdown-menu (Base UI `Menu`), field/form, hover-card (Base UI `Preview Card`), input, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, sheet (Base UI `Dialog` tabanlı), slider, switch, tabs, toast, toggle, toggle-group, tooltip

### Saf Tailwind, primitive'siz (13)

button, badge, card, alert, separator, skeleton, spinner, table, textarea, breadcrumb, pagination, aspect-ratio, kbd

### shadcn'in üçüncü parti kullandıkları — bizim çözümlerimiz

| shadcn'de | Sorun | SevenUI çözümü |
|---|---|---|
| drawer (vaul) | vaul → Radix Dialog bağımlılığı | Base UI Dialog üstüne kendi drawer implementasyonu |
| command (cmdk) | cmdk → Radix bağımlılığı | Base UI Autocomplete/Combobox üstüne kendi command'ı |
| sonner | bağımsız ama gereksiz | Base UI Toast |
| calendar | react-day-picker (Radix-free) | Aynı kütüphane |
| carousel | embla-carousel (Radix-free) | Aynı kütüphane |
| chart | recharts (Radix-free) | Aynı kütüphane |
| resizable | react-resizable-panels (Radix-free) | Aynı kütüphane |
| input-otp | input-otp (Radix-free) | Aynı kütüphane |
| sidebar | kompozit | Kendi componentlerimizden kompozit |

### Bonus (shadcn'de olmayan Base UI primitive'leri)

number-field, meter, toolbar — farklılaşma noktaları.

## Çıkış Dalgaları

Her dalga yayınlanabilir bir bütündür: component + demo + docs sayfası + registry item.

1. **Temel (~15):** `cn` lib, button, badge, card, alert, separator, skeleton, spinner, kbd, aspect-ratio, table, textarea, breadcrumb, pagination, avatar, progress. Registry pipeline'ı uçtan uca burada kanıtlanır.
2. **Form (~13):** input, label, field/form, checkbox, radio-group, switch, slider, select, combobox, number-field, toggle, toggle-group, input-otp
3. **Overlay (~11):** dialog, alert-dialog, sheet, drawer, popover, hover-card, tooltip, dropdown-menu, context-menu, menubar, toast
4. **Navigasyon & kompozit (~9):** tabs, accordion, collapsible, navigation-menu, scroll-area, toolbar, meter, command, sidebar
5. **Üçüncü parti sarmalayıcılar (~4):** calendar, carousel, chart, resizable

**Risk odakları:** Dalga 3 animasyonları; sıfırdan yazılacak drawer ve command.

## Docs Yapısı

### Component sayfa şablonu (her sayfa aynı düzen)

1. Başlık + tek cümle açıklama
2. Canlı önizleme (varsayılan demo)
3. Kurulum komutu (kopyalanabilir)
4. Kullanım (import + minimal kod)
5. Varyant/örnek önizlemeleri
6. API referansı

### Önizleme mekanizması

Blume'un `Component` özelliği `examples/` dosyalarını canlı önizleme + kaynak sekmeleriyle render eder. Örnek dosyalar çift görevlidir: docs önizlemesi **ve** `registry:example` item'ı. Tek kaynak, iki çıktı; demo kodu ile docs sapmaz.

### Tema köprüsü

Blume'un `examples.css` kancasına shadcn değişken setimiz (light/dark) bağlanır. Önizleme frame'leri Tailwind'i example dosyalarından tarar; dark mode Blume'un tema anahtarıyla senkron çalışır.

### API referansı

48 component'te elle props tablosu çürür. Her sayfada Base UI primitive dokümanına link + yalnızca SevenUI'ın eklediği props'lar (örn. `variant`, `size`) küçük tabloyla belgelenir.

Ana sayfa/landing v1'de minimal; component sayfaları önceliklidir.

## Kalite ve Pipeline

**Felsefe:** Base UI'ın test ettiğini (focus trap, aria, klavye) yeniden test etme. Bizim yazdığımızı test et.

1. **Statik:** `tsc --noEmit` (registry + examples birlikte; demo dosyaları en ucuz entegrasyon testi) + ESLint
2. **Registry bütünlük scripti (CI):** registry.json'daki her dosya diskte var mı; her `registryDependencies` gerçek item'a işaret ediyor mu; her `registry:ui` item'ının en az bir example ve bir docs sayfası var mı
3. **Kurulum smoke testi (CI):** Geçici Vite + Tailwind projesi scaffold → build edilmiş lokal registry'den `shadcn add` ile temsilci componentler (button, dialog, select) kurulur → `tsc` + build
4. **Birim/davranış testleri (dar):** Vitest + Testing Library, yalnızca sıfırdan yazılan davranışlar (drawer, command, input-otp entegrasyonu). Saf Tailwind componentlerine birim test yazılmaz.

**CI/CD (GitHub Actions):**
- PR: typecheck → lint → registry bütünlük → `shadcn build` → `blume build` → smoke test
- main: Vercel otomatik deploy → sevenui.dev

**Sürümleme:** npm publish yok. `CHANGELOG.md` + git tag'leriyle dalga çıkışları işaretlenir; kırıcı değişiklikler docs'ta not edilir.

## Doğrulanacak Varsayımlar (Dalga 1'in ilk işleri)

1. Blume'un statik dosya passthrough'u: `public/r/*.json` build sonrası `dist/`e giriyor mu? Girmiyorsa build script'ine kopyalama adımı eklenir.
2. Blume `Component` önizlemesinin Base UI portal/popup componentleriyle (dialog, tooltip) uyumu — portal'lar önizleme frame'i dışına taşabilir; ilk overlay demo'sunda doğrulanır.
3. `shadcn build`'in namespace'siz düz item isimleriyle `/r/{name}.json` çıktısı ürettiği ve `@sevenui` registries config'inin bu yolla çalıştığı, gerçek bir tüketici projede test edilir.
