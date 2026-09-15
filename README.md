# Программ хангамжийн чанарын баталгаа ба тест (F.CSA313)

**B232270019  О.Оюунжаргал **

---

## Орчин

* OS: macOS
* k6 version:

```
k6 v2.2.0 (commit/devel, go1.26.5, darwin/arm64)
x
```

## Алхам 2. Baseline (5 VU, 30s)

| Хэмжигдэхүүн | Утга |
| --- | --- |
| avg | 159.8ms |
| p90 | 250.09ms |
| p95 | 252.91ms |
| throughput (http_reqs) | 220 нийт хүсэлт, 7.294683/s |
| error rate (http_req_failed) | 0.00% (0/220) |

Энэ p95 = 252.91ms утгыг Алхам 4-ийн SLO тооцоход baseline болгон ашигласан.

## Алхам 3. Ачааллыг шатлан өсгөх (5 / 30 / 100 VU, тус бүрд 1 минут)

| VU | p90 | p95 | Throughput | Error rate |
| --- | --- | --- | --- | --- |
| 5 | 244.97ms | 249.27ms | 7.451139/s (450 нийт) | 0.00% |
| 30 | 261.63ms | 275.19ms | 43.362816/s (2658 нийт) | 0.00% |
| 100 | 261.99ms | 330.34ms | 141.957236/s (8702 нийт) | 0.00% (0/8702) |

**Хавсаргасан текст файл болон зураг:**

* `docs/run_5vu.png`, `results/run-05vu.txt`
* `docs/run_30vu.png`, `results/run-30vu.txt`
* `docs/run_100vu.png`, `results/run-100vu.txt`
* `docs/run_stages.png`,`results/run_stages.txt` — stages ашигласан үр дүн

`stages`-тэй хувилбар (`script-stages.js`, 5→30→100→0) нь ачааллын ерөнхий хандлагыг ажиглах зорилгоор хийгдсэн бөгөөд дээрх хүснэгтийн тоон утгуудыг тусдаа ажиллуулалтын гаралтын файлуудаас авсан.

## Алхам 4 — Threshold (SLO)

**SLO тооцоо:** baseline p95 (252.91ms) × 1.5 = **379.37ms**. Энэ коэффициентийг сонгосон шалтгаан нь энгийн ачааллаас дунджаар 50%-иар удаан хариу өгөхийг зөвшөөрөх боловч цаашид систем хэт удаашрахаас сэргийлэх зорилготой.

```javascript
thresholds: {
  http_req_duration: ['p(95)<379.365'],
  http_req_failed:   ['rate<0.01'],
},

```

| Тест | Threshold | Бодит утга | Үр дүн |
| --- | --- | --- | --- |
| PASS (30 VU, 1m) | p(95)<379.365ms | 271.13ms | ✓ PASS |
| PASS | rate<0.01 | 0.00% | ✓ PASS |
| FAIL (30 VU, 1m) | p(95)<50ms | 259.75ms | ✗ FAIL |
| FAIL | rate<0.01 | 0.00% | ✓ PASS |

**Хавсаргасан файл болон зураг:**

* `results/run-threshold-pass.txt`, `docs/threshold_passed.png`
* `results/run-threshold-fail.txt`, `docs/threshold_failed.png`

FAIL тестийн үед k6 `ERRO[0062] thresholds on metrics 'http_req_duration' have been crossed` гэсэн алдаа заан non-zero exit code буцаасан бөгөөд энэ нь CI/CD pipeline дээр Quality Gate ажиллаж pipeline-ийг зогсоох зарчимтай нийцэж байна.

## Алхам 5 — Локал сервер (Express)

`/` (шууд хариу) ба `/slow` (100ms хойшлуулсан хариу) endpoint-уудыг 30 VU, 30s тестлэв.

| Endpoint | p90 | p95 | Throughput | Error rate |
| --- | --- | --- | --- | --- |
| `/fast` | 5.59ms | 13.76ms | 29.852517/s (900 нийт) | 0.00% |
| `/slow` | 106.91ms | 109.74ms | 27.143261/s (840 нийт) | 0.00% |

**Хавсаргасан файл болон зураг:**

* `docs/localhost_fast.png`, `results/run-localhost-fast.txt`
* `docs/localhost_slow.png`, `results/run-localhost-slow.txt`

## Дүгнэлт

Хэрэглэгчийн тоо (VU) 5-аас 100 болон өсөхөд p95 latency 249.27ms-ээс 330.34ms болж уртассан ба throughput 7.45 req/s-ээс 141.96 req/s болж өссөн нь ачаалал ихсэхэд систем удааширдгийг харуулж байна. Харин 100 VU үед алдааны хувь (error rate) 0.00% байсан нь системийн тогтвортой байдал хэвийн болохыг илтгэв.

Baseline үзүүлэлт дээр үндэслэн тооцсон p(95) < 379.37ms гэсэн SLO босго нь 30 VU ачаалалтай үед амжилттай (PASS) биелсэн бол санаатайгаар хэт чангаруулсан утга (50ms) дээр k6 алдаа зааж (FAIL), CI/CD автомат тестэд ашиглах Quality Gate-ийн үүргээ амжилттай гүйцэтгэлээ. Мөн локал Express сервер дээрх туршилтаар сааталгүй эндпойнт нь хугацаа хойшлуулсан эндпойнтоос хамаагүй хурдан болохыг баталгаажууллаа.