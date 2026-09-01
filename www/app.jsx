import React, { useState, useEffect, useRef, useMemo, useId } from "react";
import {
  Home, CheckSquare, Target, Sun, Moon, BookOpen, Timer as TimerIcon,
  Plus, Search, Edit2, Trash2, Check, Flame, Trophy, Bell, BellRing,
  X, Pause, Play, RotateCcw, Sparkles, Droplet, Wallet, TrendingUp, Feather,
  StickyNote, CalendarDays, BarChart3, LayoutGrid, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Pin, Minus, User, Camera, LogOut, Loader2, Cloud, CloudOff, Menu,
  Star, ArrowRight, Gamepad2, MoreVertical, Palette, Eye, EyeOff,
  Settings as SettingsIcon, Heart, Vibrate, Info, ShieldCheck,
  Compass, Clock, MapPin, Disc, List, Code2, Dumbbell, Leaf, Calculator, Briefcase, GripVertical,
} from "lucide-react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import { initializeApp, getApps } from "firebase/app";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { FirebaseFirestore } from "@capacitor-firebase/firestore";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Geolocation } from "@capacitor/geolocation";

/* ------------------------------------------------------------
   Firebase — fill in from Firebase Console → Project Settings →
   General → Your apps → Web app. Native Android reads
   google-services.json automatically, so this is only used for
   the browser/web build.
   ------------------------------------------------------------ */
const firebaseConfig = {
  apiKey: "AIzaSyA9vgiAAOehn_uBcQbgKdHZPa8N3baD5p8",
  authDomain: "hayatos-228f9.firebaseapp.com",
  projectId: "hayatos-228f9",
  storageBucket: "hayatos-228f9.firebasestorage.app",
  messagingSenderId: "286251918259",
  appId: "1:286251918259:web:eccfcb6136943197bd61c6",
  measurementId: "G-PFV1T6ED85",
};
if (!getApps().length) {
  try { initializeApp(firebaseConfig); } catch (e) { console.warn("Firebase init skipped:", e); }
}

/* ------------------------------------------------------------
   localStorage shim for window.storage (only needed if this
   file is ever previewed outside a real device build)
   ------------------------------------------------------------ */
if (!window.storage) {
  window.storage = {
    get: async (key) => { const v = localStorage.getItem(key); return v === null ? null : { key, value: v, shared: false }; },
    set: async (key, value) => { localStorage.setItem(key, value); return { key, value, shared: false }; },
    delete: async (key) => { localStorage.removeItem(key); return { key, deleted: true, shared: false }; },
    list: async (prefix) => ({ keys: Object.keys(localStorage).filter((k) => !prefix || k.startsWith(prefix)), shared: false }),
  };
}

const STORAGE_KEY = "hayatos-state-v1";
const BG_LIGHT = "./img/bg-light.jpg";
const BG_DARK = "./img/bg-dark.jpg";
const BG_WALNUT = "./img/bg-walnut.jpg";
const BG_CRIMSON = "./img/bg-crimson.jpg";
const BG_AZURE = "./img/bg-azure.jpg";
const BG_JADE = "./img/bg-jade.jpg";
const BG_GALLERY = {
  "car-noir-estate": "./img/bg-car-noir-estate.jpg",
  "car-baroque-nights": "./img/bg-car-baroque-nights.jpg",
  "car-misty-ridge": "./img/bg-car-misty-ridge.jpg",
  "car-raging-bull": "./img/bg-car-raging-bull.jpg",
  "car-sunset-blossom": "./img/bg-car-sunset-blossom.jpg",
  "car-silver-star": "./img/bg-car-silver-star.jpg",
  "car-rosso-corsa": "./img/bg-car-rosso-corsa.jpg",
  "car-rain-drift": "./img/bg-car-rain-drift.jpg",
  "car-midnight-bmw": "./img/bg-car-midnight-bmw.jpg",
  "vintage-rose-garden": "./img/bg-vintage-rose-garden.jpg",
  "vintage-cottage-charm": "./img/bg-vintage-cottage-charm.jpg",
  "vintage-golden-bloom": "./img/bg-vintage-golden-bloom.jpg",
  "vintage-petals-and-paws": "./img/bg-vintage-petals-and-paws.jpg",
  "vintage-silent-swan": "./img/bg-vintage-silent-swan.jpg",
  "vintage-bougainvillea-wall": "./img/bg-vintage-bougainvillea-wall.jpg",
  "vintage-rose-whisper": "./img/bg-vintage-rose-whisper.jpg",
  "signature-snow-leopard": "./img/bg-signature-snow-leopard.jpg",
};
const LOGO_IMAGE = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCACgAKADASIAAhEBAxEB/8QAHAAAAgMBAQEBAAAAAAAAAAAABAUDBgcCAQAI/8QAOBAAAgECBAQDBwQBBAIDAAAAAQIDBBEABRIhBhMxQSJRYQcUIzJxgZEVQqGxYiQzUsFD0XKi8P/EABkBAAMBAQEAAAAAAAAAAAAAAAIDBAEFAP/EACsRAAICAgEDAwMDBQAAAAAAAAECABEDIRIEEzEiQVEyYXEFFKFSgZGx8P/aAAwDAQACEQMRAD8Ap09XPIs1FmdDDGYriFRSqr3Fuu2+Apssy+hLNTQrXcyPVZo7AFgSNJHXDCSrmzXMaSszVo6xqa+tZCBzlsdiB2+npg3iDNMlNJRz5fl0NK6/CaOKceEdN063sBbHLPqBZW/zDNPybl+L8xDkXB9TmwraaiplfXKtiukBQe+/kbjAtdlzUNYDLl6JNBUGKSGaNRdet/x/Rwbl3vMbskcklPJERLqRrEjVbax6DEM1f76887ySSy1DCJiTcnSPmB9CLG/ngGfV+8S7KUA3ckanpp6hilBG9NYKPgAoCRv4rfa3riOLKaanpLLQx3Mki6NAJUAWuScdLmNVlyR0lLVsYIW5skf7TIdgSD2F9sRLKugQxy8xWcHVqPc3IF+ttsCzH2MAgAaimagSLKHqJo4I1dzpLKBoA8IOFtdQ0q00TqYY4oo9QifZ2J66j5m1/uLYf11VJW0NalTSRyQwjR4jYhRaxFupuD9jit1VfWNTSxvKs0SlEPhHy9h5nf8ArFOA2dmanE/VE6xxyMARGpLeEt0F+5x1WUUdOxj5kMpHi1xm4ItgzMsgqMqijknQFZSACDudr9O2FR3ZgraQOt8WVUJ0KaYUZw8a6EOkedhgieueaJIm0OoIsNIGw+2ImiNrdztftbB9S2WpRLyqeZZ9gGeTv3IHlg5qAm91AIo0SYCVRddtt+vnhjPR5WtCrrNM1WTvEYxpJB8/K2F6kO4J1abi5HW/bHcw0zsGN7KGAHc4E6gA1PEijQWXSSwuLgbYkQJTuJhFBIGXZZV2x3E8bRmI06K+kkPax+5w/wAx4U9wyc5iMxppgQi6VW4ZjbYHzG/4xpJ8wghOxFNXllIlIjxSK87KHJBAUD/EdTheI3ddYgbl9NWi4v8AXHhAV7AgW69rjE9FJKkvg5hA7Bu52+mPMRPMwY3VfifRosblZEXTbawHUdMEcqRo40EMS6wrqwUG4ufEbfcf3j1qGYmklbQNalrMNgFJAJ9dsE09XFDWgCN+TJciIeFoTax0k9j1wot8Rf5mo8JUtBxDUTQZjVrCqQlmK2jkBN9gTse3rvgjM8np+FpqWupyk88LP8GRCCSAQt7/ADAjv64p8uSSxmdIZXjkjHyOGDyD089u31OJC0kfJqZJ2ldVJRbmy2FiCT23H3xESoTiBv5lK5ca4eBT1fMdRo02XloY4hJK6X1EBrnc29AQBbBXDfCY4mqalVnanpoVJI0gyGQ/uUdx1viTLsoy2ry9Vn4lpaTMxqIgaxKnSLAHyPn6YU01TIBJDHVgVCuSHiJGja177dCb4FFKkM4sTyqMTK+UWD7RpnXD1Llk9PTSAs0ysjSA2LFbWLbfLby9cVuupUirI2hS3LEhuRq8ZsBb6fTBkuZzSyRiSeoLRotnckhr7bX37E3xHMz1NTO8c2qSJgLolrnVcEW7kYBq5egag52R3PaWh8QOqp+fTVUYlbRqTUNQ1Anz9e2ERy6VaJNcUgWRUEcpG1wWJv8ATFziVsinFQ0QnljkSa0sJW7A6dJB3O//AFiwZ5xhlFflqxwZe0qMNGmrRSgY9StrdLmwxRhAUHk1GMxdOlN3W4kTKc1y+pmaqkaqkb3eTUUYkhltsf8ArCbkRlmlEYKlgdJ6C56YuNTSxionneUpLJGVZeunSbFh53vfFalp/gmenglK6rCVt0lIPVdrYdiyGpKWY+Z3muex1lAtBDl1FThW3eJb2+l+n1wnjjZjpV1NzYBjsAPXBtEaU1qmoXRECA2lduvf09PLDDiKuyuuhCUNCkUmu7yBeoG1l9D64qvlsmUV3FOR22PaJ6ODnzw05dIzIbaifCoPc/ziw1XBFTRUrzSVUQmQkKh8Ksg9T3t2whSAVDxojsniszN8q/jyw8zuh4gzCjpaiorf1CFUDgRsDo27juQB1wS1WxDwIpVrWzE8taXWRWhha6iMHlDbyIPY46BqUpFDGcUxOpTc6AfO3TrgKJmBQlVdVIbxH5h5HBNGktYzRcynTT4l5kgjFr9AT1wHnQku/Ejq/E0bBANSBTboDi8ZTxhQZZC8UOUUUeiEc5plDCZR+3wjxXPc4oyPrblzBn8Q0289+pGCCpFzSqUWTUWXqBv0+g2wNkDUbhzthsrCK+WqzNlkjjjihlueRCLLGSTZQL/5YPyyOkraimpaq8bJMUk21BV6j7ixxzQ5BmAgarioKuWlWVoeeqEo5A6i3lv9sGwS/odTHXLTwS/DYzFkD3PQG3S5B/vCH+DqLZWHqYeZs9dxHw2OGUnRoJaiOnfTFJEeehPh30juehxlbBpKcvHBqhSJrIFvZtrXv0tfBNQy1VOrMvuDyqrsNzqUMNie3UbD1xCatKapXk6ijMZW8RF7eHe3c9cT5MhcgR3UdQcvEVVT2XKY8voVnBNVJIiyK6Jve5Kix7XP4GC3FO+XU8tNAkEw1cxBMSGUdSQd7kkDyti0S8GSUtEjmsgnhMV1dJLDUBcAnv3xWK2m5LvUhlEUgW3Ylj+36EA/c4xsbppxMz9Lkw13Fq5DWZklPT0jh1lMd9AjFiW3AUj7n8YJyziIcLVkEsaI8rxch9fQO4Jvt0O3bC2nkp4qomocwRRFBKqgM6KSbgdrgf3gmtGT0dZFOZTMkxUpKLHn2W46jY36kYDHamxE42ZG5L5EaVnFlbmqmmqEgBc3LqoYki5tqvv039cBRxiCihhVGkkZpEkYG6EtYj+T/wDXAjUfvMUQpnHOi1tIb7gsGO/oBb84uWRcQ8O0OSGjq8slqaqOX40iAG+4Fw37ewtgwGytbtKQzdS95n394HkPENJl2SS0cmTQSy1EemRra3IsbFr9BuemK7xBT5qGWSGNqaJUjK0giUIp7lV6dBe488XjI/Z5nmb10kmU0s4DklHkNlVT0JJ9LbY0MeyPiWoo/dqgZHURKhjQVIZnCkbi4G3XFOMOwonxGrkLp2sjUB415n5UzGhJJI+I6f7gBuXYjqPS5wG6SyBUmezKLBmGkKRtuMfoyo9gHFWR1AzHLmo6mSMbLGRrG1jsQL4zPibhvN6bMY480pZ0qIyIvjQhGJJ6X73ud8FZHmQldblRy7hnOq+iBpIKpaR5SjSRglGIFzv0264GzOgnyyZqOfnI6atcZawDAb37ev3xr+QcSyZPw5Hlr00kZoHYrCukpYmxDHrsTc3v1GKlxVLV5wKWWookoqaA6w43bXfxgt3uCNu2DZ04gg7nQbHgXAGRzylXoYOF/wBHAqTW/qIjJfTcXbqoUHa3rjvh/PsroYJIKmgEomYM0jWZgR2H+OBa6jMsy9S8p5gcDdLWsPpp3wC+XTiWa17RNylv+49b28un5xq5q2JKucqwYAah+d1WT1NaZ6GKSAPfUbC7NbawvYC2F1A08L8xFBVDZ0YW1+YvhlQ8NVubQQrDROt1/wBxvCpANyfU72wNX0jZRVPS1bMWQeFEvpse/wDWNa2BYzHV2vKwoRplmfV+UIvu1VVU8TyaH8WpS1yLr/39MTwTVNc+mvkEkk7r8UEEMinZrDy2+xwjpqg+6Cham3U8zwC/awJ/jEsOdSxLFTk2eJPA7DxJ2IB29cIYMwqCcrMoUnQmicVVg4ir/h07U8i+BiyBbjc3FuxNt/TFYq4aimZKqNp6RxMTr1b6lH7LDoBcfXFvyGio8+mf3zMFpUqLRhm+ZWK2sB+cdcS5KKOjqDHKtSVVhEt7sxUbkEbHyNsJrIR3a1HthzZVPU1qIzxznSSKxzAyrNZNTxjSq7+Pp85H945aoaugOmVDLE9xG4ALAA/KfpvhdTQmmblTKCDCutJDdS/UH03GCX1Gqp6qo53MkQMsYW+jqLi/a2F5HLEXJsmV3rkSZ9Hlk9VPqroZY46uC4kUWBsPlXbuO+C6SlaOhalniLrpjVC6gkC99m7WtYj1x7l+bSNmsMf+prpUYSvCil9QAsBp7bW+mH2eZ4J8tq6ejoJKE8wSmN4wuvxbm37fLbyxta2ajseJGQuWqv5lcp6GozLMGHLkj5hCA0/7zbYetj+cbJ7NvZuklQrz/wColIHMYgaYx9O5Nr4rvBcCSUiVyonxhckWtqG32xvfCEdPlmTr8SNJZBzCG2Y/br0xV0+MceZ8wUS9x/RZfR5RTAIqxqo3dvL1OEmc+0rhvJGVJ60yOw1BYUL7ed+mFHFfEwqmFCaAVNI7KXdm8A372N8Kc79ntLm9DSvlrxQL47vLdyL9APQXNgcUZOSix7SrL0eXGoZh5jWL248JyI766sKguxMXS/39MNmzDhP2iZbJRNJT1kUyXCsNLrcbMt9wR5jGPQeynKEmkpBnksLzuFdioIYj9rC+LBxJwZFwdRUk+U84lB8WTmXNxYAgdh9MIGQk0YoYmumEpnHfs5l4X4jiU1Mk9NVwmOKS9rtfq3a52v52vjiqzHKMtyqjo70VQqAwELHbcghtQIuG3v5d8aFWUtX7S+B0hhAfMKCYMLixbf8A9b4xjizhqsyXMxDVUFQkkkTrokB0GVd9W/W5I39TgFZsZPEeY7B1DdMTSg38yHK6bLDnpYuYctgCiOaVdY6FbEgd+lsWKpyjgFYYXmipgjhneKORhNESL2Hcm/isfLFeqKXPzkKCojSlpoJBKI3jKBioBUWHU+I7nrit5lW1bRTz1UamoeYwlEumgMTvY+ViAfXHkdsX1L5mrmOAHnjHq+0CfNazLoFky6tlWCOYrFC+7EMdmJ3tsb+WEeZ++ZnUM9XVF3QhC7NtECdug77m+GDRwPHHG2imjjO8YcjVv+T4cE0clBmMhpqaGolIDaoiQyz/AOIJt23F/LGrkavtIGzOwonUTU1X+i1c8DVKwyqdKVMa3aQdR6eWB9YzbMY/GZgNlVAsbuepufP1OH2YZRlZnVXUUhAY6lWzXt8pFyLrY3t6YVQ0tNT1ETqrusrloy5KtGLXuR3vg+4Kiw1io+pp5svYzQG8hVmYI+plaxvYdtNwfpgrJappoElR9ZhUroY2DXHbyJJwLVlIc7WeMBmc3Y/5KLWHl1J+2CuGskqJ4HaLlI71TRys2yqpA8Q33G9vriIgsoAPmEoZqUGQvPy8xL1UkukBlcbFCjWt/P8AWDZom0LFIQQGKhmbS2tuux3NwScaLF7OeGanKpssIqGm8bJOx8QsNvTSN8ZTmuiTNpstGYe8pTP8OpRbDT2/At9cOydOUA5SrqeiydOAX95pPCVPkVFl8dTBURNmSkxVcocRsqW7H6W388OZ6Ciz68lbGBzP/Ih1Ai4tb02388ZEsDUdSXSGWopZo0LuouF3GoHyFwf4xrVJIEjRQbLpAA9LYoxtyXiw1KG6stgGDiAB7/M0jgngGgehiaGrjeljJBRFsQeu+BuNsk4koq2HN6amiNHQqHYQN43APiLjvttbyxP7K8wmGbPTFyY5YiSOouManKiyRlWAKsLEHuMMoyZW4nUy2ip8r4rhWuyrMCtrCRFa67dmBwx4gz+ly7JDSUNQJZ1vJvuu3a/bFUzLKMvyTMqiKjkWl5rkFNW3XAs2dZBk61FJnOZxHnRsohjQu0Rt8xK9Pvhb5SwIA8zpNlZwA50IjzTPY6iWPNIrxyawJI2Nu/XF+4YzAcURVlDWRMYZATE5B2NvmB+uFlTwTQ12UZXUK0c7vACs0I8Mq9r4Iz3inLOBa6ly6WjllMsMHNMJUcob2vvck7nbCR9oDMJbeA694nnyudQksLsjAAbMP+iN8M+O+G6XiTh+ohmRefApnp5bbpIouPsbWIxWeF87oc243efL5GlingVmJFrMAR/QGL/mDFKGdh1ETkW/+JxSPpkOTTT8u1PtAimoZaIZQstQthJUSSgRMb3tp638rYSy14414jkoYqCl5lUqCRObbQkalgb7dTv+cJYgHzBqqpOvRKTJG2zO19h6HEmcVtPXp+oRF8tqDMC5j8B8ItvboAGA264lzZidMdQsnW5Mg45DYivibhCbIqyMZrWUstI8hLTQb3e9luOuncfjFfqaKfJZBXEaZeYqkxjZzqa4Hbt/WLhUZPmfEtbTUMMMlc8bgRkDUWPXSd7k2v8AjFgzb2V5q2ulhanmaniNQdN10vYXUA9Wt1wKlm2g1FnEcpJwroTN5qisrstiqCqJBIzka1vyyNh3t6X6749osrzCRVqEzGljllUB6WWW7Ffr277Yf0+RpQxSUcjOKZXJl1H/AGm6hh5Ai23YjAAyNWcc5GSMoUkIsCugkkj03xiZ1BIIko4qfUItkQ86oq4lZo76C97hSb7/AN4awZ8mqGFmYxnTKdI5bF1HYja39nCXL4MwzH3pKVZJY3j+Il9lA3UfUnA61LxrE7KEeMgaCNgwG3X17Y3smrhCxRjZ/wBfz6ploYXzHMKiAM1obswjJvvY/LthNWwSxQ/6kTQQsQUYKQGPTxee34wyy/jbM8tqWeEqsjdHIAIbuQVsfsdsdcQcUVPETRRVbNKiR6VLEWBHdbfL32xQKrfmPZkZeTMeUaLxFnMtJFCoK6EWDTZVCqT4V9QcaZRzB4IzYg6FNj9MZPFnNByaGKWP4sa/GkZCwke91sOotcjFgyfjlIZTS1iOyqbCcLa9zt4cMBPkmacpceozePZg4XiKEeccn9Y2Nvlxgvso4iyx89hqpK+lSDlu2t5Qvaw69740fiD2r8MZJBKFzSnqqhVOiCFwzMfLbpjeUwzGePoqufiSrlmmtSmpYaRcXXV6YmHCHD3EdVHJleYLlLKgSancOzOSLFltfUD3BxVqnjqXMszklmTZ2PwxuNzjVPZbluUVMvvjkSTsDZCbhfO2EEmWiiIwyPPKL2c5fBlGbyzPlkbFKOrli3YdTe3Tc7emIcwyLKuK6w8YtHVTxRsGpyiDTIibbg7ixG/mMWbjrLoM84ZrMkpqA1RnQAKosU3FmBPfAnFHFGR8E8Fpl0jrHOtMIoKVW8YIGxI/vBKvvFFvgSuezuojqPaLmM6PFoZDI2kaQptuPycaBxzxflnDXDVdWVFXEHWFljjDAs7kEAAYyHgj2ZU/FmSyZzDxFWU9ZU3V1jN1Q3uQR33tjM/aHkuZ8J5hJTTT1E1SlyutLhwD+25Nx3xjPWovMT9VQDOMxpZK6QFLJUysQqgKGA+UE/U3+2K1PnEsCe7a2kKzcuQmxFjt09bdsBUzpm9XDAZ2ad2YA6e3W2GGV0QFfPUO95HPKZCgFnAve3Y7HCXVUNmRObMawZ1JQ1c0samN6aJW5ocgxkkEgkemLFmPtZziorltRUnMkseZCrG7EbsQTboRviq1JE5Tkho5JnYFpFFlUKLsb/Yb4rq1EvPjjDmFDLsdVvDe258r4HA7AenUbi6nJivtmpZxX1Wa5rJd5iUDSynqklx3+1/uMctnMNRWR0tPOGQQaXc3uwIub39TjykrDltBmUciNGhgeNZQOtr3II3sDYDzwkyZqQV8FRZhG6gWANjpNmJ+1sB2wxLGIPJjZnceWcVZbCJY6LMaejUrJJIIyqgHoxNu+Bq7MWmmlLqpeOQHVb5zfv54/QVJxflWbUNXTDMqJ4BG0kxqWIIuPD4Wtf6eeMCWGA1JlqLyxO7adKkBgWIsT2PcY6OVQtUdTp9f0q4AvBrBgRzC9Pqeni0LfUune5xBDMFljWYuukhwsag38zv3xrvCXsmy7Mqehrg80rVKtIYSDpC3HhJ63tcXxX+NuB8ty2oiahWpjcuzNTsdwl+qkjoPzjXxFQWM3J+lZseLvNVfmUg1dPLIoMUg8Ru2q1t9vPf+sdoWFLTxqxCkmVATfxHbc99hhhWZDethl0OsNVIVhKnZ2Xbb1v1xxWNT0tbLIYTaGn5UaEG3MJ0g/axOJWezU53iDpUzKUERa97EqLi99x/eOYcwrJGLX8Vyw33O++BdMozdKSIMoaTQBuASfp+fS+G0uUtlqFklMsULWIPzB26jBhwtAwlMmoa2WrkDSx8s7BWva5vjT+F+JazJVhKyodJtqVyL4zOlkp2SfLp4pEl1hlJFtDjYi/0v+MXfI8to5VRpZWldRbl33Nx0wRoyvE25sEXtGzKvpXWOoSEgaeZEuq3388Zn7QuFs2zLKX4kieoqWhYGWR2vZfPFs4X4bqKioMaExoUsgZbB7dMabT8NU7ZFWZRUOJuZEfhsOu3QHvjPBlB41PzL7NvahV8F10tpJHonY6o26nyOLL7T+LH40ymGtWDmRqrB5EO0ZHcWFzcYzPjfh6s4e4vqcrpoucqm6Ipvsd7fXE9VxCicPPlgkQTwtvGrkFLbmxHkcecCIZ7UqZNwfwzXZtmOunpk0pEWEmr91rm3/LZu2HlTwnWU9K+mQ1apGspqYUJYbhbNfoQL39Bhj7Ms3oqCjkppswrI2kZpIiyIsSy6b3Dt0Jtb1w0f2nw1qV1HSwJNrheQTX0qOi2023vvjHxYmQMTv/tVKE6Xpj04d2ppRszvLAKKOQQSxoGVu8thcn8jCnLqAVFLBPNT3dbadO/NLHb+/wCcT0WZxR5iYdSS0yuYwW73BP26kHD7MhRnLTFTao6pnEaQpch1BB0ofPoN+uISSvpHvOQVs6gtRV0UNDJSqvNac62K21Ig8RW/cXBvj3MKvL48kNTDQU8FVVXQPTg6hDcarAkjci32OPM2yippqRveaRVaZ1jnVbnlodwPCbbXAOOEjpMxhoqailkbkbNotZVUW0gdRc3N/rg0pVImcWDVKnJmU8byU+zgvZnIBOi3X845leCVRHSoytEQ7RLcjcW1H1vgiopacTLE5ESIwWS+0mg7az369B5YPyqi90rhTzaCaiSSNjYfIV0rv5EnUPth3cFQuWoRlnEPFuU1Mz0+YVYCqsLcsghoh2HYW88dtxE+fG2YVs1TmMDGIyqRdo76jb6W3898LlZVlo8qcNURoxEzggC999/L/wBY+SGjjzCoLuXJk5SvGtmRze2m/U269L4FshYU0NuoyMvFjqOYTryuioTHrenkLpIy/KWYtrAH1wKmTw1uYNUGYxQ06KxRl1MHFzuB1Pe2IaqhahEE6TvNARIrSR3NxtYED5TthhWUNciw1+XwVUPvCl+dHH8J32JRz2bY79N8IWybEUFLeBFOWy0ry1MtLFyYl1SxSTbuT+5mPqN7DDeGaJ68RVMckjchLxqoOtyd2t5i2BXp2h4kjnp3Io6yAu6MRt2ZLf4nvjzM5DllRTlfE6oXdWFyyix/BNhjX22p4XDMxoJZJ4KmIRyvV6I5GDeHWDpYgnz03+5xZcjoszy2qirGoZ6elhBmZpI9KvtuRfsLjFLo80hXNKWPSogpZQ3IuRHK3zG3lY7DGk5n7RaN6dY5NdSqLrDIu5jLWCknb5hvbsMUYVUj1tRnS6HBiyW2V+NS4ZfxTC0CSTzRUuka03uXPdR5YKqfaLMZ6eKlp3WnqCwR1HiVgt9Wrz67d8YnnXEMtdWtmGXQOBLMAqi4RD5keWCkzWfNgj1CyTpSoY10Ha6Am/pfpgcmQgWIrJlrxGGbqeJGzCry9mWZ/E8ugkgsx2v2Ntvtil5rkzZWWqWehnkZdSrzhIyqQblgNwRt+bYIpp55K5YofeTJXOqukcthGoFibdCVuTftfC5sr5WYViVXMZoITFI6i4ve1/v/AN4xWO2MmZgYDJm1RPU00ax65PhgRabKygWFx33vvhzBUwx0maaXVrxrDCigghwykm/Ybf1hVSUMyVQWBWLKnMZiRYDVut+ovbBdZWSxU1XSxQIJ9AaQj/x+K4/CqBjSBeoMv3AvB8cmU/qOY5fE8NU6+6e9DSHvfUdj37E444y4apqeCapy6UlVJhlgk8Wht9NnHYnt/OK/lPH3EWX5NT5aaqn5axm0UyB+VFf5gPTc44z3izMs3lMTFEoowjiOFQDJt4Se564fkbD26Hmv5nVfP0f7bt16vmRQTyTTSRzTSFGh5aI0pF3UXNvv3xdvZfmuT5VQski0cEtReoEjqT5xnU1rBRY7Dzxn8TrJ8aJy9RAeXIsY32vY7997XGJIpKnLWNPM0kVLSg6IntaQNY9e25vibE5xnl7zndPnOPIMnmWni6iyasknoaeKnjzIsJVl0ixFwFVj21H8YqlT77TxRJIiitiNjEFAIP7Rt1tYj7YFlmlrGhlpqdZOZ8GRmJ0qOoFvLa/2xLWZ5XxSLUzBoGglC30ANKQNiL+n26YLI3ca6m9VnGZy4FT1crWuzKqpzGIlK88sz20uG1abdSPPDGGCgSSWtqWSVi/vLcobN/xsPQ/nDn2VZFR8RZpV5rmcU9QadBIqMvhJbqTbvbt64tGZcJZQOdyuTShI2Xnh9SRqblFKn7Ye/SuygqZbj/SM74+6pEzGXKXpZJZKWWtdQia5HUofEL22uLm/2wwzbPM2yjIjkMktPP7wrGxDB0ViPFqv9Ou2B6jmRVbS0DSSJORHMFfwp4QVBHlt18tsFVGTyz01K888clQkrLqkOq6ndgSOwBsO2+JFfjU5q5Xxk8TUSuUqSlM08iSkRpK2sEML+Mg9j54LzmmjXn1U88nMiVYgp/4/tAP23xzmMqZYInDiRIbxo1gW8Y20m3kL3N8GSuZKqKqkmEOpDL7vVLpR7iwu3Ydeo7YA2KqADcQU9HU5YjzxRSM3WKVzubnxEbbdemGkGao0Kw00Yg0uWkB3DgfOAB+beeD8r4hrNX6cohhD+M8+MOjve2q/kdtx5YXNRxU9BJBJKsTq3M5oOpQxb5QQN+l7d8NYggE+Y1gtDidzylpYfeJQF0hZBULsbSICLixPkf8A9bDrL6JM5qF/RWd1Zh7xTxAbf5Fb36Yr1RPqWlmk0U8gcyq25UKxt/OJ+EONG4QrHqaSCKUl9Llejx7Gwv2uPrhmJRYL+J7GF5AZPpm1ZzwRldBl0IyycRzAqglEaAuCPESbX9bYy7PMpzbLM6raZdCPNEFnlV9pV2s31PXbzxZX9rVHWSNLX0TxnmXhiy8+GRj0JLdDa9xhdQ5jLU8VrVT8uDLq1yH5jFnVGGkkX/43v9sOzjFQZPJ/1Ol169Icatg+oyoUmS1dI6rMXFPIGdZgPAoF7j1byvtginMQz92hjhmp4qcJLIB1sLEt/lcgY7TJsxpMzrKGqzV0FFIuhTvzoySdQ8gbgn64FLnKY6qkjZpJJGMomAsJ+oAv6XvbErkbqcg2DCZZKWHMqeWmKjnxPrliTZVuUIPlYf1gSFgKikjRWDIrJJIDYsBcgnva394WyvnWW03LniZNL8oEMNKXW+9vO+5wTlFVCcy5ObTvHLP8GWo035Q6XHmLX6Yw46Xc9sz7Mn/TaFDDIqxyNde5kYgkk/Q2thjz6avy1Gdf96FYAJDq0yC4J/Ft8CZ7lsRJOXVbywQdZ5I9Km4CkWPewvhc2lKCKnoZnDOrzlhsbdLW+3848FBA+ZuxqTUXvM9XLSyTaF5RkkIJTlEAAnb0JFvXBNLnH61Rrl8yvKkbmSNFUFthsCTvY2t98EV0NNXQNTJWZeDUOwNT7wgGoE6Q46kW74X8P0sCVUNYaygjelLK7SzBNRVvCQAd7jDVGrrc0Sz5dn/EPDEYqMtM2VwzRq9Qj6GVBvuB1HT64mHtCzGsySnp6ySjLVTGSTVF8Zk1bWsLHp164QZxX0+dPNl02dU0EcvxIpdilv2oxBv1/FscyzZbJV0MhrqdZKVOUwSQaRpF+t9/t1vjTlfjVmUL1OZE4q2oJDV1GXZlKkDSyQM3KlVRZr37EdCMMsxmmeamhEwZHguoNzzCRvqI+n5xxW8Q0tBl0LQVUDvqZ9OoM7FttRsbAgf3hbUZ2EpaOpknop1jkYRIhswjt37i97WPlhIVmo1JSCZaqKhnkpopIQj1E6pIqRANyVUFdSnobAXP0OFvFMGdUyVMpojHFGEDVEi+Ig7Gx7EbfnF/9nXEvBtBwnDStWZVR5qNfvMlRMAXjLX0hvUdhgPjDifLqugrKxM5y2SnYJCsAlEjuhOoAC/UWF/TFX7cIOR3OoeixjD3C2/iZhkkzDMnikqCY28TK3Rb+h/ODM2eYrFHDrM8qmOPbSiqCR9vQ4RVF+fUVC1VLIXO7FgvX0vhnDnC5hNTc2sjjVYuVLGXAUhQbb+ZNsJdPVy9pzahMWXVNbUUtNUoy09NSoqpEb3Y7FiPv/GJqzIoI83FCVWNWHhA21Lp6/W56emIs3NPS5TTvTZjTa2e0jJIryEEXG19t7/bHbZvTS1hnaWnLUToIXaQXYEAMDvuOuBskAiDuD0OULVZTLUzloY6chSisdUzC9tN+hxcarhLNRRQST1YakkZJ4Wj8dmNwFJ2K+RGKd+q0tXV0GSvPGtOhtJOJRbUbkn6dsTVXEFXBk8uXT56KlWZVjiSQMdIGwDdh07+eGKn9UpwDFR7t/2lrzTNxxAyLmcYhrKVfcnm0hucqkWPh6bWF/QYSZ5RVRyijq0k5sWoqzRG4Rb7fb64WZNmUFI3JnqKWNnBUyO4JBI7WPTEn6nldVkE9NHXe6oJkVlLC5FzuB5fTCChDakxq7qT0UMUkz0765I5QRpsSXNtQOrsRa/l0GJo0oMziMFbGI6pAAstrFyCNSn18vqcKqTMKelqFYVNENJESSRuLIh62B6bd/XHzas1UrFmdHGdIBd5lRXQjdT31A/kY04m5VPVW47iyqshSIopeGSRpZEkPiRSSq6gewvgb9Ili4imjSh5jCS8bEtp6Bu2wF8D0GY5eY1y+rzPUARdxMLH01DtfBdRxTS0dSZnrI2lljW8KNrjsu1tj1Pnj3qBoCCAZ//Z";

/* ------------------------------------------------------------
   Haptics — subtle vibration feedback on real devices, silently
   does nothing in a plain browser (no Capacitor runtime).
   ------------------------------------------------------------ */
const isNative = () => { try { return Capacitor.isNativePlatform(); } catch (e) { return false; } };
// Live mirror of state.prefs / appSettings so plain module-level helper functions
// (haptics, notifications) can check the current toggles without needing React context.
let RUNTIME_PREFS = { vibration: true, notifications: true, taskReminders: true, prayerReminders: true, goalReminders: true, habitReminders: true, dailySummary: true, streakWarning: true, studyReminders: true, hobbyReminders: true, dateFormat: "DD MMM YYYY", timeFormat: "12h", weekStartsOn: "Sunday" };
function syncRuntimePrefs(prefs, appSettings) {
  RUNTIME_PREFS = { ...RUNTIME_PREFS, ...(prefs || {}), notifications: appSettings ? appSettings.notifications !== false : true };
}
function notificationAllowed(category) {
  if (!RUNTIME_PREFS.notifications) return false;
  if (category && RUNTIME_PREFS[category] === false) return false;
  return true;
}
async function hapticTap() { if (!isNative() || !RUNTIME_PREFS.vibration) return; try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {} }
async function hapticSuccess() { if (!isNative() || !RUNTIME_PREFS.vibration) return; try { await Haptics.notification({ type: NotificationType.Success }); } catch (e) {} }
async function hapticWarn() { if (!isNative() || !RUNTIME_PREFS.vibration) return; try { await Haptics.notification({ type: NotificationType.Warning }); } catch (e) {} }

/* ------------------------------------------------------------
   Local notifications — used for reminders, pomodoro completion,
   and prayer-time alerts. Requires permission (requested once at
   login) and only actually fires on the native Android/iOS app.
   ------------------------------------------------------------ */
let notifPermissionAsked = false;
let notifChannelReady = false;
// Android 8+ routes every notification through a "channel" — without one, Capacitor's
// LocalNotifications plugin falls back to a bare default channel that has no vibration
// pattern set, so notifications arrive silently with no buzz even with vibration ON in
// Settings. Creating our own channel with an explicit vibration pattern fixes that.
async function ensureNotifChannel() {
  if (notifChannelReady || !isNative()) return;
  try {
    await LocalNotifications.createChannel({
      id: "hayatos_reminders",
      name: "HayatOS Reminders",
      description: "Task, prayer, and study reminders",
      importance: 5,
      visibility: 1,
      vibration: true,
      lights: true,
    });
    notifChannelReady = true;
  } catch (e) { /* ignore — iOS has no channels, or already exists */ }
}
async function ensureNotifPermission() {
  if (!isNative()) return false;
  try {
    const check = await LocalNotifications.checkPermissions();
    if (check.display === "granted") { await ensureNotifChannel(); return true; }
    if (notifPermissionAsked) return false;
    notifPermissionAsked = true;
    const req = await LocalNotifications.requestPermissions();
    if (req.display === "granted") await ensureNotifChannel();
    return req.display === "granted";
  } catch (e) { return false; }
}
let notifIdCounter = 1000;
async function notifyLocal(title, body, category) {
  if (!isNative() || !notificationAllowed(category)) return;
  try {
    const granted = await ensureNotifPermission();
    if (!granted) return;
    await LocalNotifications.schedule({ notifications: [{ id: notifIdCounter++, title, body, channelId: "hayatos_reminders", schedule: { at: new Date(Date.now() + 300) } }] });
  } catch (e) { /* ignore */ }
}
// Schedule a repeating daily notification at a fixed HH:MM (used for prayer times / reminders).
async function scheduleDailyNotification(id, title, body, hour, minute, category) {
  if (!isNative()) return;
  if (!notificationAllowed(category)) { cancelNotification(id); return; }
  try {
    const granted = await ensureNotifPermission();
    if (!granted) return;
    await LocalNotifications.schedule({ notifications: [{ id, title, body, channelId: "hayatos_reminders", schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true } }] });
  } catch (e) { /* ignore */ }
}
async function cancelNotification(id) {
  if (!isNative()) return;
  try { await LocalNotifications.cancel({ notifications: [{ id }] }); } catch (e) {}
}
// Schedule a one-time notification at a specific future Date (used for task due dates, goal deadlines, etc.)
async function scheduleAtNotification(id, title, body, when, category) {
  if (!isNative()) return;
  if (!notificationAllowed(category) || !when || when.getTime() <= Date.now()) { cancelNotification(id); return; }
  try {
    const granted = await ensureNotifPermission();
    if (!granted) return;
    await LocalNotifications.schedule({ notifications: [{ id, title, body, channelId: "hayatos_reminders", schedule: { at: when, allowWhileIdle: true } }] });
  } catch (e) { /* ignore */ }
}
function parseTimeLabel(label) {
  if (!label || label === "None") return null;
  const m = String(label).match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return [9, 0];
  let h = parseInt(m[1], 10); const mins = parseInt(m[2], 10); const ap = m[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return [h, mins];
}
function dateAt(dateKey, hour, minute) { const d = new Date(dateKey + "T00:00:00"); d.setHours(hour, minute, 0, 0); return d; }
function idHash(str, base, span) { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return base + (h % span); }
// Roughly every 2 hours across waking hours — used for "still incomplete" nudges (Tasks/Goals/Hobby).
const REMINDER_SLOTS = [9, 11, 13, 15, 17, 19, 21];

/* ------------------------------------------------------------
   Location — used for the Qibla compass and (in future) accurate
   prayer-time calculation. Requested explicitly the first time the
   person opens the Qibla or Namaz-location screen, same pattern as
   the notification permission prompt above.
   ------------------------------------------------------------ */
let locationPermissionAsked = false;
async function ensureLocationPermission() {
  if (!isNative()) return navigator.geolocation ? "browser" : false;
  try {
    const check = await Geolocation.checkPermissions();
    if (check.location === "granted" || check.coarseLocation === "granted") return true;
    if (locationPermissionAsked) return false;
    locationPermissionAsked = true;
    const req = await Geolocation.requestPermissions();
    return req.location === "granted" || req.coarseLocation === "granted";
  } catch (e) { return false; }
}
async function getCurrentLocation() {
  const granted = await ensureLocationPermission();
  if (!granted) return null;
  try {
    if (isNative()) {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    }
    return await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  } catch (e) { return null; }
}

// Great-circle bearing from a point to the Ka'bah (Mecca), in degrees from true north.
const KAABA = { lat: 21.4225, lng: 39.8262 };
function qiblaBearing(lat, lng) {
  const toRad = (d) => (d * Math.PI) / 180, toDeg = (r) => (r * 180) / Math.PI;
  const phi1 = toRad(lat), phi2 = toRad(KAABA.lat), dLambda = toRad(KAABA.lng - lng);
  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}
// Turns lat/lng into a readable "City, Country" name (OpenStreetMap Nominatim — free, no key).
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();
    const a = data.address || {};
    const city = a.city || a.town || a.village || a.county || a.state_district;
    const parts = [city, a.state, a.country].filter(Boolean);
    return parts.length ? parts.join(", ") : (data.display_name || null);
  } catch (e) { return null; }
}

/* ------------------------------------------------------------
   Backup — writes a JSON snapshot straight into the public
   Downloads/HayatOS folder on-device via the Filesystem plugin
   (falls back to a normal browser download when running outside
   the native app, e.g. while testing in a desktop browser).
   ------------------------------------------------------------ */
async function backupStateToDownloads(state, push) {
  const filename = `hayatos-backup-${todayKey()}.json`;
  const json = JSON.stringify(state, null, 2);
  if (isNative()) {
    try {
      await Filesystem.writeFile({ path: `Download/HayatOS/${filename}`, data: json, directory: Directory.ExternalStorage, encoding: Encoding.UTF8, recursive: true });
      push(`Saved to Downloads/HayatOS/${filename}`, "success");
      return;
    } catch (e) { push("Couldn't write to Downloads — check storage permission", "danger"); return; }
  }
  try {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    push("Backup downloaded", "success");
  } catch (e) { push("Backup failed", "danger"); }
}

/* ------------------------------------------------------------
   Utilities
   ------------------------------------------------------------ */
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

/* ---------------- USERNAME RULES ----------------
   lowercase only · letters, numbers, underscore, dot · can't start/end with a dot ·
   no two dots in a row · 3-20 chars. Typing uppercase silently lowercases as you go. */
const normalizeUsername = (raw) => (raw || "").toLowerCase().replace(/[^a-z0-9_.]/g, "");
const USERNAME_RE = /^[a-z0-9_]+(\.[a-z0-9_]+)*$/;
// The Capacitor Firestore plugin's getDocument() throws a "not-found" style error
// for a document that simply doesn't exist yet (unlike the web SDK, which returns an
// empty snapshot) — that's the *good* case for a username check (nobody has it), so
// it must NOT be treated the same as a real connectivity/permission failure.
function isFirestoreNotFound(e) {
  const s = String(e?.code || e?.message || "").toLowerCase();
  return s.includes("not-found") || s.includes("not found") || s.includes("no document to update");
}
function usernameError(u) {
  if (!u) return "Pick a username";
  if (u.length < 3) return "At least 3 characters";
  if (u.length > 20) return "20 characters max";
  if (!USERNAME_RE.test(u)) return "Only letters, numbers, _ and . — can't start/end with a dot, no double dots";
  return null;
}
const todayKey = (d = new Date()) => {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const addDays = (key, n) => { const d = new Date(key + "T00:00:00"); d.setDate(d.getDate() + n); return todayKey(d); };
const hexToRgb = (hex) => { const h = hex.replace("#", ""); const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16); return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }; };
const rgbToHex = (r, g, b) => "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const shade = (hex, amt) => { const { r, g, b } = hexToRgb(hex); return rgbToHex(r + amt, g + amt, b + amt); };
const isDarkColor = (hex) => { const { r, g, b } = hexToRgb(hex); return (0.299 * r + 0.587 * g + 0.114 * b) < 140; };
const averageColorFromImage = (dataUrl) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => {
    try {
      const c = document.createElement("canvas"); c.width = 40; c.height = 40;
      const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, 40, 40);
      const data = ctx.getImageData(0, 0, 40, 40).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
      resolve(rgbToHex(r / n, g / n, b / n));
    } catch (e) { resolve("#3A2A1A"); }
  };
  img.onerror = () => resolve("#3A2A1A");
  img.src = dataUrl;
});
const DAY_MS = 86400000;
const taskArchivedAt = (t) => {
  if (t.completed) return t.completedAt || Date.now();
  if (t.dueDate && t.dueDate < todayKey()) return new Date(t.dueDate + "T00:00:00").getTime() + DAY_MS;
  return null;
};
const isTaskActiveToday = (t) => {
  if (t.completed) return false;
  if (!t.dueDate && !t.startDate) return true;
  const start = t.startDate || t.dueDate;
  const end = t.dueDate || t.startDate;
  const today = todayKey();
  if (today < start) return false;
  if (today > end) return false;
  return true;
};
// Tasks that belong to "today" regardless of done/not-done — used by the Dashboard + Focus Score
// so yesterday's leftover / future-dated tasks never bleed into "today's" numbers.
const isTaskForToday = (t) => {
  const today = todayKey();
  if (!t.dueDate && !t.startDate) return true;
  const start = t.startDate || t.dueDate;
  const end = t.dueDate || t.startDate;
  return today >= start && today <= end;
};
const lastNDays = (n, endKey = todayKey()) => { const a = []; for (let i = n - 1; i >= 0; i--) a.push(addDays(endKey, -i)); return a; };
const weekStartingSunday = (endKey = todayKey()) => {
  const d = new Date(endKey + "T00:00:00");
  const offset = RUNTIME_PREFS.weekStartsOn === "Monday" ? (d.getDay() + 6) % 7 : d.getDay();
  const start = addDays(endKey, -offset);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};
const dayLabel = (key) => new Date(key + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" });
const dayLabel1 = (key) => dayLabel(key).slice(0, 1);
// For the Month chart: real "12", "13"… day-of-month numbers instead of a bare weekday
// letter, so each point on a 30-day chart is actually identifiable.
const dayOfMonthLabel = (key) => String(parseInt(key.slice(8, 10), 10));
const prettyDate = (key) => {
  if (!key) return "";
  const d = new Date(key + "T00:00:00");
  const fmt = RUNTIME_PREFS.dateFormat;
  if (fmt === "MM/DD/YYYY") return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
  if (fmt === "DD/MM/YYYY") return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : h < 21 ? "Good Evening" : "Good Night"; };
const fmtHM = (m) => { const h = Math.floor(m / 60), mm = Math.round(m % 60); return h > 0 ? `${h}h ${mm}m` : `${mm}m`; };
const fmtTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
/* ---------------- XP / LEVEL SYSTEM ----------------
   Placeholder curve — flat 100 XP per level. Swap XP_PER_LEVEL / awardXP call sites
   later once the real chart (levels, XP amounts, achievement art) is ready. */
const XP_PER_LEVEL = 100;
function levelFromXP(xp) {
  const level = Math.floor((xp || 0) / XP_PER_LEVEL) + 1;
  const into = (xp || 0) % XP_PER_LEVEL;
  return { level, into, need: XP_PER_LEVEL, pct: Math.round((into / XP_PER_LEVEL) * 100) };
}
function computeAchievements(state) {
  const tasksDone = state.tasks.filter((t) => t.completed).length;
  const goalsDone = state.goals.filter((g) => g.progress >= 100).length;
  const fajrLogged = Object.values(state.namaz).filter((d) => d && d.fajr).length;
  const focusMinutes = state.study.sessions.reduce((a, s) => a + s.minutes, 0);
  const namazIsComplete = (k) => { const d = state.namaz[k]; return !!d && PRAYERS.every((p) => d[p]); };
  const namazStreak = Math.max(computeStreak(namazIsComplete), computeLongest(namazIsComplete, lastNDays(60)));
  return [
    { key: "first_step", label: "First Step", sub: "Complete your first task", emoji: "🪴", unlocked: tasksDone >= 1 },
    { key: "consistency", label: "Consistency", sub: `${namazStreak}/7 day namaz streak`, emoji: "🔥", unlocked: namazStreak >= 7 },
    { key: "early_bird", label: "Early Bird", sub: `${Math.min(fajrLogged, 5)}/5 Fajr logged`, emoji: "🌅", unlocked: fajrLogged >= 5 },
    { key: "task_master", label: "Task Master", sub: `${Math.min(tasksDone, 50)}/50 tasks`, emoji: "🏅", unlocked: tasksDone >= 50 },
    { key: "focus_mode", label: "Focus Mode", sub: `${Math.min(Math.floor(focusMinutes / 60), 10)}/10h focus`, emoji: "🧘", unlocked: focusMinutes >= 600 },
    { key: "goal_getter", label: "Goal Getter", sub: `${Math.min(goalsDone, 3)}/3 goals done`, emoji: "🎯", unlocked: goalsDone >= 3 },
  ];
}

const computeStreak = (isDone, endKey = todayKey()) => {
  let cur = 0, cursor = endKey;
  for (let i = 0; i < 400; i++) {
    if (isDone(cursor)) { cur++; cursor = addDays(cursor, -1); }
    else { if (i === 0) { cursor = addDays(cursor, -1); continue; } break; }
  }
  return cur;
};
const computeLongest = (isDone, days) => { let longest = 0, run = 0; for (const d of days) { if (isDone(d)) { run++; longest = Math.max(longest, run); } else run = 0; } return longest; };
const QUOTES = [
  "Small daily improvements lead to staggering long-term results.",
  "Discipline is choosing between what you want now and what you want most.",
  "You don't have to be great to start, but you have to start to be great.",
  "Progress, not perfection.", "Consistency beats intensity.",
  "What you do today builds the person you become tomorrow.",
  "Focus on the step in front of you, not the whole staircase.",
  "A little progress each day adds up to big results.",
  "Habits are the compound interest of self-improvement.",
];
const quoteOfDay = () => QUOTES[new Date().getDate() % QUOTES.length];
const MOODS = [
  { key: "great", emoji: "😄", label: "Great" }, { key: "good", emoji: "🙂", label: "Good" },
  { key: "okay", emoji: "😐", label: "Okay" }, { key: "low", emoji: "😔", label: "Low" },
  { key: "rough", emoji: "😣", label: "Rough" },
];
const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const PRAYER_LABEL = { fajr: "Fajr", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" };
const TASK_TAG_COLORS = {
  Study: { bg: "var(--tile-1-bg)", fg: "var(--tile-1-fg)" },
  Growth: { bg: "var(--tile-3-bg)", fg: "var(--tile-3-fg)" },
  Spiritual: { bg: "var(--tile-2-bg)", fg: "var(--tile-2-fg)" },
  Personal: { bg: "var(--tile-4-bg)", fg: "var(--tile-4-fg)" },
  General: { bg: "var(--tile-4-bg)", fg: "var(--tile-4-fg)" },
};
const tagColor = (cat) => TASK_TAG_COLORS[cat] || TASK_TAG_COLORS.General;

/* ------------------------------------------------------------
   Default state
   ------------------------------------------------------------ */
function defaultState() {
  return {
    theme: "auto", // 'auto' | 'light' | 'dark'
    profile: { name: "", username: "", photoURL: "", bio: "", location: "", dob: "", joinedAt: Date.now(), xp: 0 },
    tasks: [], goals: [], namaz: {},
    namazTimes: { fajr: "05:00", dhuhr: "13:15", asr: "16:30", maghrib: "18:45", isha: "20:15" },
    tasbih: { count: 0, target: 33 },
    trackingPaused: false,
    study: { dailyGoalMinutes: 120, subjects: [], sessions: [], breaks: [] },
    pomodoro: { focusMin: 25, breakMin: 5, longBreakMin: 15, roundsBeforeLong: 4, log: [] },
    water: { goalGlasses: 8, glassMl: 250, days: {} },
    sleep: { goalHours: 8, logs: [] },
    money: { currency: "₹", transactions: [], savingsGoal: { target: 0, current: 0 } },
    trading: { lessons: [], notes: [], sessions: [] },
    journal: { entries: [] },
    notes: { folders: [], items: [] },
    reminders: [],
    activity: [],
    hobbies: [],
    habits: [], mood: { logs: [] }, health: { logs: [] },
    scheduleEvents: [],
    customTheme: { mode: "color", color: "#3A2A1A", imageDataUrl: "", accent: "#B5813B" },
    appSettings: { haptics: true, notifications: true },
    prefs: {
      themeMode: "system", liquidGlass: true, glassTransparency: 60, blurIntensity: 60, accentColor: "", animations: true,
      taskReminders: true, prayerReminders: true, goalReminders: true, habitReminders: true, dailySummary: true, streakWarning: true,
      studyReminders: true, hobbyReminders: true,
      notificationSound: "Default", vibration: true,
      defaultTaskPriority: "Medium", defaultReminderTime: "9:00 AM", weekStartsOn: "Sunday", autoCompleteRecurring: false,
      goalProgressStyle: "Bar", completedTaskBehaviour: "Move to Achieve",
      prayerCalcMethod: "Muslim World League", madhhab: "Standard (Shafi'i)", prayerNotifications: true, adhanSound: "Adhan (short)", preprayerReminder: "10 min before",
      dailyProductivityScore: true, weeklySummary: true, monthlySummary: true, streakTracking: true, showCompletedTasks: true,
      appLock: false, biometricLock: false, hideNotificationContent: false, dataEncryption: true,
      cloudSync: true,
      language: "English", dateFormat: "DD MMM YYYY", timeFormat: "12h", firstDayOfWeek: "Sunday", units: "Metric", timeZone: "",
      appLockPin: "", biometricLock: false,
    },
  };
}

function dayScore(key, s) {
  const nd = s.namaz[key];
  // While currently in Hobby mode, Namaz tracking is paused — don't let today's (stale/zero)
  // namaz data drag down today's Focus Score. Past days are unaffected (no historical mode log).
  const namazLive = !(s.trackingPaused && key === todayKey());
  const namazPct = namazLive ? (nd ? (PRAYERS.filter((p) => nd[p]).length / 5) * 100 : 0) : null;
  const studyMin = s.study.sessions.filter((x) => x.date === key).reduce((a, x) => a + x.minutes, 0);
  const studyPct = Math.min(100, (studyMin / Math.max(1, s.study.dailyGoalMinutes)) * 100);
  let taskPct = null;
  if (key === todayKey()) { const t = s.tasks.filter(isTaskForToday); const total = t.length; const done = t.filter((x) => x.completed).length; taskPct = total ? (done / total) * 100 : null; }
  const parts = [namazPct, studyPct, taskPct].filter((x) => x !== null);
  return parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0;
}
const STAT_COLORS = { tasks: "#4E9BE0", goals: "#E0B23E", namaz: "#4F9A6C", hobby: "#DA5470" };
function timeAgo(ts) {
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60); if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24); if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30); return `${months}mo ago`;
}
function goalPaceStatus(g) {
  if ((g.progress || 0) >= 100) return "completed";
  if (!g.deadline) return "onTrack";
  const createdKey = g.createdAt ? todayKey(new Date(g.createdAt)) : todayKey();
  const totalDays = Math.max(1, (new Date(g.deadline) - new Date(createdKey)) / DAY_MS);
  const elapsedDays = Math.max(0, (new Date(todayKey()) - new Date(createdKey)) / DAY_MS);
  const expectedPct = Math.min(100, (elapsedDays / totalDays) * 100);
  return (g.progress || 0) >= expectedPct - 8 ? "onTrack" : "atRisk";
}
const GOAL_PACE_META = { onTrack: { label: "On Track", tone: "success" }, atRisk: { label: "At Risk", tone: "danger" }, completed: { label: "Completed", tone: "default" } };
function rangeKeys(fromKey, toKey) {
  const out = []; let k = fromKey; let guard = 0;
  while (k <= toKey && guard < 400) { out.push(k); k = addDays(k, 1); guard++; }
  return out;
}
function tasksPctForRange(state, fromKey, toKey) {
  const t = state.tasks.filter((x) => x.dueDate && x.dueDate >= fromKey && x.dueDate <= toKey);
  if (!t.length) return 0;
  return Math.round((t.filter((x) => x.completed).length / t.length) * 100);
}
function namazPctForRange(state, fromKey, toKey) {
  const today = todayKey();
  const days = rangeKeys(fromKey, toKey);
  // While currently in Hobby mode, today's namaz is paused/frozen — exclude just today from
  // this average (same rule as dayScore's Focus Score) so it doesn't drag Progress % / the
  // Namaz line down for a day that isn't actually being tracked right now.
  const vals = days.filter((k) => !(state.trackingPaused && k === today)).map((k) => { const nd = state.namaz[k]; return nd ? (PRAYERS.filter((p) => nd[p]).length / 5) * 100 : 0; });
  if (!vals.length) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}
function hobbyMinutesForRange(state, fromKey, toKey) {
  let total = 0;
  (state.hobbies || []).forEach((h) => (h.sessions || []).forEach((s) => { if (s.date >= fromKey && s.date <= toKey) total += s.minutes; }));
  return total;
}
function hobbyPctForRange(state, fromKey, toKey) {
  const days = rangeKeys(fromKey, toKey).length;
  return Math.min(100, Math.round((hobbyMinutesForRange(state, fromKey, toKey) / (days * 60)) * 100));
}
/* Real per-date progress: goals with milestones report the % of milestones completed
   on or before the given date (using each milestone's completedAt), so the Stats line
   actually moves up on the day a milestone gets ticked. Goals without milestones fall
   back to their current progress value (no daily history exists for those). */
function goalsPctAsOf(state, dateKey) {
  if (!state.goals.length) return 0;
  const cutoff = new Date(dateKey + "T23:59:59").getTime();
  const vals = state.goals.map((g) => {
    const ms = g.milestones || [];
    if (ms.length) { const doneBy = ms.filter((m) => m.done && m.completedAt && m.completedAt <= cutoff).length; return Math.round((doneBy / ms.length) * 100); }
    return g.progress || 0;
  });
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}
function studyMinutesForRange(state, fromKey, toKey) {
  return state.study.sessions.filter((x) => x.date >= fromKey && x.date <= toKey).reduce((a, x) => a + x.minutes, 0);
}
function weekdayBuckets(state, fromKey, toKey) {
  const days = rangeKeys(fromKey, toKey);
  const sums = [0, 0, 0, 0, 0, 0, 0], counts = [0, 0, 0, 0, 0, 0, 0];
  days.forEach((k) => { const d = new Date(k + "T00:00:00").getDay(); sums[d] += dayScore(k, state); counts[d]++; });
  return sums.map((s, i) => (counts[i] ? s / counts[i] : 0));
}
function buildStatsSeries(state, mode, fromKey, toKey) {
  const totalDays = rangeKeys(fromKey, toKey).length;
  if (mode === "day") {
    return [{ label: "Today", key: fromKey, tasks: tasksPctForRange(state, fromKey, toKey), namaz: namazPctForRange(state, fromKey, toKey), hobby: hobbyPctForRange(state, fromKey, toKey), goals: goalsPctAsOf(state, toKey) }];
  }
  if (mode === "year" || totalDays > 60) {
    const out = [];
    let y = parseInt(fromKey.slice(0, 4), 10), m = parseInt(fromKey.slice(5, 7), 10);
    const endY = parseInt(toKey.slice(0, 4), 10), endM = parseInt(toKey.slice(5, 7), 10);
    let guard = 0;
    while ((y < endY || (y === endY && m <= endM)) && guard < 36) {
      const mStart = `${y}-${String(m).padStart(2, "0")}-01`;
      let mEnd = todayKey(new Date(y, m, 0));
      const clampedStart = mStart < fromKey ? fromKey : mStart;
      const clampedEnd = mEnd > toKey ? toKey : mEnd;
      out.push({ label: new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short" }), tasks: tasksPctForRange(state, clampedStart, clampedEnd), namaz: namazPctForRange(state, clampedStart, clampedEnd), hobby: hobbyPctForRange(state, clampedStart, clampedEnd), goals: goalsPctAsOf(state, clampedEnd) });
      m++; if (m > 12) { m = 1; y++; } guard++;
    }
    return out;
  }
  return rangeKeys(fromKey, toKey).map((k) => ({ label: mode === "month" ? dayOfMonthLabel(k) : dayLabel1(k), key: k, tasks: tasksPctForRange(state, k, k), namaz: namazPctForRange(state, k, k), hobby: hobbyPctForRange(state, k, k), goals: goalsPctAsOf(state, k) }));
}

// Real hour-by-hour breakdown for "Today": uses actual timestamps on completed tasks and
// hobby/study sessions, so it shows exactly when things happened during the day — not an
// estimate. (Namaz isn't timestamped per-tap, only per-day, so it isn't part of this one.)
const HOUR_LABELS = ["12a","1a","2a","3a","4a","5a","6a","7a","8a","9a","10a","11a","12p","1p","2p","3p","4p","5p","6p","7p","8p","9p","10p","11p"];
function hourlyActivityToday(state, dayKey) {
  const start = new Date(dayKey + "T00:00:00").getTime();
  const end = start + 24 * 3600 * 1000;
  const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: h, label: HOUR_LABELS[h], tasks: 0, minutes: 0 }));
  (state.tasks || []).forEach((t) => {
    if (t.completed && t.completedAt >= start && t.completedAt < end) buckets[new Date(t.completedAt).getHours()].tasks += 1;
  });
  (state.hobbies || []).forEach((h) => (h.sessions || []).forEach((s) => {
    if (s.createdAt >= start && s.createdAt < end) buckets[new Date(s.createdAt).getHours()].minutes += (s.minutes || 0);
  }));
  (state.study?.sessions || []).forEach((s) => {
    if (s.createdAt >= start && s.createdAt < end) buckets[new Date(s.createdAt).getHours()].minutes += (s.minutes || 0);
  });
  return buckets;
}
function HourlyTodayChart({ buckets }) {
  const [active, setActive] = useState(null);
  const n = buckets.length;
  const W = Math.max(n * 30, 320);
  const H = 190;
  const pad = 14;
  const maxTasks = Math.max(1, ...buckets.map((b) => b.tasks));
  const maxMin = Math.max(1, ...buckets.map((b) => b.minutes));
  const barW = (W - pad * 2) / n - 6;
  const stopSwipe = { onTouchStart: (e) => e.stopPropagation(), onTouchMove: (e) => e.stopPropagation(), onTouchEnd: (e) => e.stopPropagation() };
  const hasAny = buckets.some((b) => b.tasks > 0 || b.minutes > 0);
  return (
    <div>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }} {...stopSwipe}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}>
          {buckets.map((b, i) => {
            const x = pad + i * ((W - pad * 2) / n);
            const tH = (b.tasks / maxTasks) * (H - pad * 2 - 20);
            const mH = (b.minutes / maxMin) * (H - pad * 2 - 20);
            return (
              <g key={i}>
                <rect x={x} y={H - pad - tH} width={barW / 2 - 1} height={tH} rx={2} fill={STAT_COLORS.tasks} opacity={active === i ? 1 : 0.85} />
                <rect x={x + barW / 2 + 1} y={H - pad - mH} width={barW / 2 - 1} height={mH} rx={2} fill={STAT_COLORS.hobby} opacity={active === i ? 1 : 0.85} />
                <rect x={x - 3} y={0} width={barW + 6} height={H} fill="transparent" onClick={() => setActive(i === active ? null : i)} />
              </g>
            );
          })}
        </svg>
        <div style={{ display: "flex", width: W, marginTop: 4 }}>
          {buckets.map((b, i) => (
            <span key={i} className={`t-xs ${active === i ? "bold" : "t-faint"}`} style={{ flex: `0 0 ${(W - pad * 2) / n}px`, marginLeft: i === 0 ? pad : 0, textAlign: "center", cursor: "pointer" }} onClick={() => setActive(i === active ? null : i)}>
              {b.label}
            </span>
          ))}
        </div>
      </div>
      {!hasAny && <div className="t-xs t-faint" style={{ marginTop: 8, textAlign: "center" }}>Nothing logged yet today — complete a task or log a session to see it here.</div>}
      {hasAny && active === null && <div className="t-xs t-faint" style={{ marginTop: 6, textAlign: "center" }}>Scroll sideways · tap an hour to inspect</div>}
      {active !== null && (
        <div className="chart-tooltip">
          <div className="t-xs bold t-sub" style={{ marginBottom: 4 }}>{buckets[active].label}</div>
          <div className="row-between t-xs" style={{ marginTop: 2 }}><span style={{ color: STAT_COLORS.tasks, fontWeight: 700 }}>● Tasks completed</span><span className="bold">{buckets[active].tasks}</span></div>
          <div className="row-between t-xs" style={{ marginTop: 2 }}><span style={{ color: STAT_COLORS.hobby, fontWeight: 700 }}>● Hobby/Study</span><span className="bold">{buckets[active].minutes}m</span></div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------
   Theme resolution: 'auto' follows the OS/browser preference,
   'light'/'dark' are manual overrides. Applied via data-theme
   on <html>, which the plain-CSS design system reacts to.
   ------------------------------------------------------------ */
function useAppliedTheme(themeSetting) {
  const [resolved, setResolved] = useState("dark");
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const mode = themeSetting === "auto" ? (mq.matches ? "dark" : "light") : themeSetting;
      setResolved(mode);
      document.documentElement.setAttribute("data-theme", mode);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", mode === "dark" ? "#0A0203" : "#FBF3E9");
    };
    apply();
    const onChange = () => themeSetting === "auto" && apply();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [themeSetting]);
  return resolved;
}
/* ============================================================
   PRIMITIVES
   ============================================================ */
function Card({ strong, tap, className = "", children, ...rest }) {
  return <div className={`card ${strong ? "card-strong" : ""} ${tap ? "card-tap" : ""} ${className}`} {...rest}>{children}</div>;
}
function Btn({ variant = "primary", icon, block, glass, className = "", children, ...rest }) {
  const cls = variant === "ghost" ? "btn-ghost" : variant === "danger" ? "btn-danger" : "";
  return <button className={`btn ${cls} ${icon ? "btn-icon" : ""} ${block ? "btn-block" : ""} ${glass ? "liquid-glass" : ""} ${className}`} {...rest}>{children}</button>;
}
function Chip({ active, children, ...rest }) {
  return <button type="button" className={`chip liquid-glass ${active ? "active" : ""}`} {...rest}>{children}</button>;
}
function Badge({ tone = "default", children, ...rest }) {
  const cls = tone === "default" ? "badge" : `badge badge-${tone}`;
  return <span className={cls} {...rest}>{children}</span>;
}
function ProgressBar({ value, thin }) {
  const v = Math.max(0, Math.min(100, value || 0));
  return <div className={`progress-track ${thin ? "thin" : ""}`}><div className="progress-fill" style={{ width: `${v}%` }} /></div>;
}
function ProgressRing({ value = 0, size = 150, stroke = 13, label, glow }) {
  const id = useId();
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, offset = c - (v / 100) * c;
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", filter: glow ? "drop-shadow(0 0 14px var(--accent))" : "none" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--divider)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--accent)" strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 700ms cubic-bezier(.22,1,.36,1)" }} />
      </svg>
      <div className="ring-center">
        <div className="ring-num">{typeof label === "string" ? label : `${Math.round(v)}%`}</div>
      </div>
    </div>
  );
}
function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return createPortal(
    <div className="modal-scrim anim-fadeIn" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet card-strong">
        <div className="row-between g-2" style={{ marginBottom: 18 }}>
          <div className="t-lg xbold">{title}</div>
          <Btn variant="ghost" icon onClick={onClose}><X size={18} /></Btn>
        </div>
        <div className="col g-3">{children}</div>
        {footer && <div className="row g-3" style={{ marginTop: 18 }}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
function Field({ label, children }) {
  return <div className="field"><label>{label}</label>{children}</div>;
}
function Input(props) { return <input {...props} className={`input ${props.className || ""}`} />; }
function TextArea(props) { return <textarea {...props} className={`input ${props.className || ""}`} />; }
function Select(props) { return <select {...props} className={`input ${props.className || ""}`}>{props.children}</select>; }
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function VStepper({ value, onDec, onInc, width }) {
  return (
    <div className="vstepper" style={{ width: width || 46 }}>
      <button type="button" onClick={() => { onDec(); hapticTap(); }} className="vstepper-btn"><ChevronUp size={13} /></button>
      <span className="vstepper-val">{value}</span>
      <button type="button" onClick={() => { onInc(); hapticTap(); }} className="vstepper-btn"><ChevronDown size={13} /></button>
    </div>
  );
}
/* ---------------- compact wheel picker (used by TimeField + DateField everywhere) ---------------- */
/* Shows only the currently selected value — drag/scroll up-down over it to change, like a native spinner. */
const WHEEL_ITEM_H = 32;

function WheelColumn({ options, value, onChange, width = 40, format }) {
  const ref = useRef(null);
  const suppress = useRef(false);
  const scrollTimer = useRef(null);
  const idxOf = (v) => { const i = options.indexOf(v); return i < 0 ? 0 : i; };

  // Keep the wheel's scroll position in sync whenever the external value changes
  // (initial mount, or a sibling wheel changing e.g. month affecting day count).
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const targetTop = idxOf(value) * WHEEL_ITEM_H;
    if (Math.abs(el.scrollTop - targetTop) > 2) {
      suppress.current = true;
      el.scrollTop = targetTop;
      requestAnimationFrame(() => { suppress.current = false; });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options.length]);

  const onScroll = () => {
    if (suppress.current) return;
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const el = ref.current; if (!el) return;
      const idx = Math.max(0, Math.min(options.length - 1, Math.round(el.scrollTop / WHEEL_ITEM_H)));
      const snapTop = idx * WHEEL_ITEM_H;
      if (Math.abs(el.scrollTop - snapTop) > 1) el.scrollTo({ top: snapTop, behavior: "smooth" });
      if (options[idx] !== value) { onChange(options[idx]); hapticTap(); }
    }, 80);
  };
  return (
    <div className="wheel-col" ref={ref} onScroll={onScroll} style={{ width, height: WHEEL_ITEM_H }}>
      {options.map((o) => (
        <div key={o} className="wheel-item" style={{ height: WHEEL_ITEM_H }}>
          {format ? format(o) : o}
        </div>
      ))}
    </div>
  );
}
function WheelPicker({ children }) {
  return (
    <div className="wheel-picker" style={{ height: WHEEL_ITEM_H }}>
      <div className="wheel-highlight" />
      <div className="wheel-cols">{children}</div>
    </div>
  );
}
const YEARS_RANGE_NEAR = (() => { const y = new Date().getFullYear(); return Array.from({ length: 14 }, (_, i) => y - 3 + i); })();
const YEARS_RANGE_WIDE = Array.from({ length: 2400 - 1950 + 1 }, (_, i) => 1950 + i);
function DateField({ value, onChange, yearsRange }) {
  const parts = value ? value.split("-").map(Number) : [];
  const [y, m, d] = parts.length === 3 ? parts : [new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()];
  const daysInMonth = new Date(y, m, 0).getDate();
  const DAYS = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);
  const set = (ny, nm, nd) => {
    const nmw = ((nm - 1 + 12) % 12) + 1;
    const dd = Math.min(nd, new Date(ny, nmw, 0).getDate());
    onChange(`${ny}-${String(nmw).padStart(2, "0")}-${String(dd).padStart(2, "0")}`);
  };
  return (
    <WheelPicker>
      <WheelColumn width={40} options={DAYS} value={Math.min(d, daysInMonth)} onChange={(nd) => set(y, m, nd)} />
      <WheelColumn width={54} options={MONTHS_SHORT} value={MONTHS_SHORT[m - 1]} onChange={(mo) => set(y, MONTHS_SHORT.indexOf(mo) + 1, d)} />
      <WheelColumn width={56} options={yearsRange || YEARS_RANGE_NEAR} value={y} onChange={(ny) => set(ny, m, d)} />
    </WheelPicker>
  );
}
const WHEEL_HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const WHEEL_MINUTES = Array.from({ length: 60 }, (_, i) => i);
const WHEEL_AMPM = ["AM", "PM"];
function TimeField({ value, onChange }) {
  const [hh24, mm] = value ? value.split(":").map(Number) : [9, 0];
  const isPM = hh24 >= 12;
  const hh12 = ((hh24 + 11) % 12) + 1;
  const set = (h12, min, pm) => {
    let h24 = h12 % 12; if (pm === "PM") h24 += 12;
    onChange(`${String(h24).padStart(2, "0")}:${String(((min % 60) + 60) % 60).padStart(2, "0")}`);
  };
  return (
    <WheelPicker>
      <WheelColumn width={40} options={WHEEL_HOURS} value={hh12} onChange={(h) => set(h, mm, isPM ? "PM" : "AM")} />
      <span className="wheel-colon">:</span>
      <WheelColumn width={40} options={WHEEL_MINUTES} value={mm} format={(v) => String(v).padStart(2, "0")} onChange={(m) => set(hh12, m, isPM ? "PM" : "AM")} />
      <WheelColumn width={50} options={WHEEL_AMPM} value={isPM ? "PM" : "AM"} onChange={(ap) => set(hh12, mm, ap)} />
    </WheelPicker>
  );
}
function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch" aria-checked={checked}
      onClick={() => { onChange(!checked); hapticTap(); }}
      className="toggle-switch" data-on={checked ? "1" : "0"}
    >
      <span className="toggle-knob" />
    </button>
  );
}
/* Generic settings row used across Settings + Security + Account views. */
function SettingsToggleRow({ icon: Icon, label, checked, onChange }) {
  return (
    <div className="row-between" style={{ padding: "11px 4px" }}>
      <span className="row g-2 t-sm bold">{Icon && <Icon size={16} className="t-faint" />} {label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}
/* App-themed option picker — replaces the native OS <select> so it always matches
   the current theme + liquid-glass look instead of Android's default dropdown. */
function PickerModal({ title, options, value, onSelect, onClose }) {
  return createPortal(
    <div className="modal-scrim anim-fadeIn" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet card-strong liquid-glass" style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <div className="row-between g-2" style={{ marginBottom: 14 }}>
          <div className="t-lg xbold">{title}</div>
          <Btn variant="ghost" icon onClick={onClose}><X size={18} /></Btn>
        </div>
        <div className="col g-2">
          {options.map((o) => (
            <button key={o} onClick={() => { onSelect(o); hapticTap(); onClose(); }} className="row-between" style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid var(--card-border)", background: value === o ? "color-mix(in srgb, var(--accent) 16%, var(--card))" : "var(--card)" }}>
              <span className="t-sm bold">{o}</span>
              {value === o && <Check size={15} color="var(--accent)" />}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
function SettingsSelectRow({ icon: Icon, label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="row-between" style={{ padding: "11px 4px", gap: 10, background: "none", border: "none", width: "100%", cursor: "pointer" }} onClick={() => setOpen(true)}>
        <span className="row g-2 t-sm bold" style={{ minWidth: 0 }}>{Icon && <Icon size={16} className="t-faint" style={{ flex: "none" }} />} <span className="truncate">{label}</span></span>
        <span className="row g-1 t-sm t-sub" style={{ flex: "none" }}>{value} <ChevronRight size={14} /></span>
      </button>
      {open && <PickerModal title={label} options={options} value={value} onSelect={onChange} onClose={() => setOpen(false)} />}
    </>
  );
}
function SettingsActionRow({ icon: Icon, label, sub, onClick, danger }) {
  return (
    <a className="nav-item" style={{ cursor: "pointer", color: danger ? "var(--danger)" : undefined }} onClick={onClick}>
      <Icon size={17} />
      <div className="flex-1">
        <div className="t-sm bold">{label}</div>
        {sub && <div className="t-xs t-faint">{sub}</div>}
      </div>
      <ChevronRight size={16} className="t-faint" />
    </a>
  );
}
function SettingsSection({ title, icon: Icon, children }) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <div className="section-label row g-2" style={{ alignItems: "center" }}>{Icon && <Icon size={15} />} {title}</div>
      <div className="col g-0">{children}</div>
    </Card>
  );
}
/* ---------------- STACK LIST (contained internal scroll + long-press drag-reorder) ----------------
   - Scrolls inside its OWN box (doesn't move the whole page).
   - Cards sit in a normal list with a real gap — no overlap.
   - Long-press a card to pick it up (it shrinks + lifts), drag up/down, release to drop it in the new spot. */
function StackList({ items, renderItem, onReorder }) {
  const listRef = useRef(null);
  const itemRefs = useRef({});
  const [liveIds, setLiveIds] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dragDY, setDragDY] = useState(0);
  const [moreBelow, setMoreBelow] = useState(false);
  const pressTimer = useRef(null);
  const pressStartY = useRef(null);
  const drag = useRef(null);
  const lastHapticScroll = useRef(0);

  const baseIds = items.map((it) => it.id);
  const ids = liveIds || baseIds;
  const byId = Object.fromEntries(items.map((it) => [it.id, it]));
  const ordered = ids.map((id) => byId[id]).filter(Boolean);

  useEffect(() => { if (!dragId) setLiveIds(null); }, [items.length]); // eslint-disable-line

  const checkOverflow = () => {
    const el = listRef.current; if (!el) return;
    setMoreBelow(el.scrollHeight - el.scrollTop - el.clientHeight > 12);
  };
  useEffect(() => { checkOverflow(); }); // recheck after every render (content can change height)

  const onScroll = (e) => {
    checkOverflow();
    const top = e.currentTarget.scrollTop;
    if (Math.abs(top - lastHapticScroll.current) > 46) { lastHapticScroll.current = top; hapticTap(); }
  };

  const finishDrag = (commit) => {
    clearTimeout(pressTimer.current); pressTimer.current = null;
    if (commit && drag.current && liveIds) { onReorder && onReorder(liveIds); hapticTap(); }
    drag.current = null; setDragId(null); setDragDY(0);
    if (listRef.current) listRef.current.style.overflowY = "";
  };

  const handlePointerMove = (e) => {
    if (!drag.current) return;
    e.preventDefault();
    const dy = e.clientY - drag.current.startY;
    setDragDY(dy);
    const curOrder = liveIds || baseIds;
    const idx = curOrder.indexOf(drag.current.id);
    const pointerMid = drag.current.startTop + drag.current.h / 2 + dy;
    let newIdx = idx;
    curOrder.forEach((oid, i) => {
      if (oid === drag.current.id) return;
      const top = drag.current.tops[oid];
      if (top == null) return;
      const mid = top + drag.current.h / 2;
      if (pointerMid > mid && i > newIdx) newIdx = i;
      if (pointerMid < mid && i < newIdx) newIdx = i;
    });
    if (newIdx !== idx) {
      const next = curOrder.slice();
      next.splice(idx, 1);
      next.splice(newIdx, 0, drag.current.id);
      setLiveIds(next);
      hapticTap();
    }
  };

  const startPressTimer = (id, e) => {
    const el = itemRefs.current[id];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    pressStartY.current = e.clientY;
    pressTimer.current = setTimeout(() => {
      const curOrder = liveIds || baseIds;
      const tops = {};
      curOrder.forEach((oid) => { const oe = itemRefs.current[oid]; if (oe) tops[oid] = oe.getBoundingClientRect().top; });
      drag.current = { id, startY: pressStartY.current, startTop: rect.top, h: rect.height, tops };
      setLiveIds(curOrder.slice());
      setDragId(id);
      if (listRef.current) listRef.current.style.overflowY = "hidden";
      hapticTap();
    }, 320);
  };

  return (
    <div className={`stack-list-scroll ${moreBelow ? "has-more" : ""}`} ref={listRef} onScroll={onScroll}>
      <div className="col g-3">
        {ordered.map((item, i) => {
          const isDragging = dragId === item.id;
          return (
            <div
              key={item.id}
              ref={(el) => (itemRefs.current[item.id] = el)}
              data-stack-id={item.id}
              className={`stack-item anim-fadeUp ${isDragging ? "dragging" : ""}`}
              style={{
                zIndex: isDragging ? 999 : 1,
                animationDelay: `${Math.min(i, 8) * 45}ms`,
                transform: isDragging ? `translateY(${dragDY}px) scale(.96)` : undefined,
              }}
              onPointerDown={(e) => { if (e.pointerType === "mouse" && e.button !== 0) return; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {} startPressTimer(item.id, e); }}
              onPointerMove={(e) => {
                if (drag.current && drag.current.id === item.id) { handlePointerMove(e); return; }
                if (pressTimer.current && pressStartY.current != null && Math.abs(e.clientY - pressStartY.current) > 10) {
                  clearTimeout(pressTimer.current); pressTimer.current = null;
                }
              }}
              onPointerUp={() => finishDrag(true)}
              onPointerCancel={() => finishDrag(false)}
            >
              {renderItem(item, i)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function HCarousel({ children }) {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const onScroll = () => {
    const el = ref.current; if (!el) return;
    const idx = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
    setActive(idx);
  };
  const count = React.Children.count(children);
  return (
    <>
      <div className="hcarousel" ref={ref} onScroll={onScroll} onTouchStart={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
        {children}
      </div>
      {count > 1 && (
        <div className="hcarousel-dots">
          {Array.from({ length: count }).map((_, i) => <span key={i} className={i === active ? "on" : ""} />)}
        </div>
      )}
    </>
  );
}
function HobbyCylinder({ side, onSwitch }) {
  const trackRef = useRef(null);
  const [pos, setPos] = useState(side === "hobby" ? 1 : 0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const moved = useRef(false);

  useEffect(() => { setPos(side === "hobby" ? 1 : 0); }, [side]);

  const clientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);
  const KNOB = 26;

  const down = (e) => { e.stopPropagation(); dragging.current = true; moved.current = false; startX.current = clientX(e); };
  const move = (e) => {
    if (!dragging.current || !trackRef.current) return;
    e.stopPropagation();
    const x = clientX(e);
    if (Math.abs(x - startX.current) > 6) moved.current = true;
    const rect = trackRef.current.getBoundingClientRect();
    let next = (x - rect.left - KNOB / 2) / (rect.width - KNOB);
    setPos(Math.max(0, Math.min(1, next)));
  };
  const up = (e) => {
    e.stopPropagation();
    dragging.current = false;
    hapticTap();
    if (!moved.current) { onSwitch(side === "hobby" ? "namaz" : "hobby"); return; }
    const settled = pos < 0.5 ? "namaz" : "hobby";
    setPos(settled === "hobby" ? 1 : 0);
    if (settled !== side) onSwitch(settled);
  };

  return (
    <div
      ref={trackRef}
      className="hobby-cylinder liquid-glass"
      onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={() => dragging.current && up({ stopPropagation(){} })}
      onTouchStart={down} onTouchMove={move} onTouchEnd={up}
    >
      <span className="hobby-cylinder-label">{side === "hobby" ? "Hobby" : "Namaz"}</span>
      <div className="hobby-cylinder-knob" style={{ left: `calc((100% - ${KNOB}px) * ${pos})` }}>
        {side === "hobby" && pos > 0.5 ? <Heart size={14} /> : <Sparkles size={14} />}
      </div>
    </div>
  );
}
function EmptyState({ icon, title, sub }) {
  return <div className="empty anim-fadeIn">{icon}<div className="bold" style={{ color: "var(--text-1)" }}>{title}</div>{sub && <div className="t-sm">{sub}</div>}</div>;
}
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = (msg, tone = "default") => {
    const id = uid();
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  };
  const Host = () => createPortal(
    <div className="toast-host">
      {toasts.map((t) => <div key={t.id} className="toast anim-fadeIn" style={{ color: t.tone === "success" ? "var(--success)" : t.tone === "danger" ? "var(--danger)" : "var(--text-1)" }}>{t.msg}</div>)}
    </div>,
    document.body
  );
  return { push, Host };
}
/* ============================================================
   NAVIGATION — 7 tabs: Home, Tasks, Goals, Stats, Namaz, Study, More
   ============================================================ */
const TABS = [
  { key: "dashboard", label: "Home", icon: Home },
  { key: "tasks", label: "Tasks", icon: CheckSquare },
  { key: "goals", label: "Goals", icon: Target },
  { key: "statistics", label: "Stats", icon: BarChart3 },
  { key: "namaz", label: "Namaz", icon: Sparkles },
  { key: "study", label: "Study", icon: BookOpen },
  { key: "more", label: "More", icon: LayoutGrid },
];
const MORE_TABS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "settings", label: "Settings", icon: SettingsIcon },
  { key: "achieve", label: "Achieve", icon: Trophy },
  { key: "pomodoro", label: "Focus Timer", icon: TimerIcon },
  { key: "water", label: "Water", icon: Droplet },
  { key: "sleep", label: "Sleep", icon: Moon },
  { key: "money", label: "Money", icon: Wallet },
  { key: "trading", label: "Trading", icon: TrendingUp },
  { key: "journal", label: "Journal", icon: Feather },
  { key: "notes", label: "Notes", icon: StickyNote },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "reminders", label: "Reminders", icon: BellRing },
];

function Sidebar({ active, onNav }) {
  const isMoreActive = MORE_TABS.some((m) => m.key === active) && active !== "more";
  return (
    <aside className="shell-sidebar">
      <div className="brand-row">
        <img src={LOGO_IMAGE} alt="HayatOS" className="brand-logo" />
        <div className="brand-name">HayatOS</div>
      </div>
      <nav className="col g-1">
        {TABS.filter((t) => t.key !== "more").map((tb) => (
          <a key={tb.key} className={`nav-item ${active === tb.key ? "active" : ""}`} onClick={() => onNav(tb.key)}>
            <tb.icon size={18} /><span>{tb.label}</span>
          </a>
        ))}
      </nav>
      <div className="section-label" style={{ marginTop: 22, paddingLeft: 13 }}>More</div>
      <nav className="col g-1">
        {MORE_TABS.map((tb) => (
          <a key={tb.key} className={`nav-item ${active === tb.key ? "active" : ""}`} onClick={() => onNav(tb.key)}>
            <tb.icon size={17} /><span>{tb.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
function TabBar({ active, onNav, lastNH }) {
  const isMoreActive = MORE_TABS.some((m) => m.key === active) || active === "more";
  const isHobby = lastNH === "hobby";
  return (
    <nav className="tabbar liquid-glass">
      {TABS.map((tb) => {
        if (tb.key === "namaz") {
          const isActive = active === "namaz" || active === "hobby";
          return (
            <button key="namaz" onClick={() => onNav(isHobby ? "hobby" : "namaz")} className={`tab-item ${isActive ? "active" : ""}`}>
              <div className="tab-pill">{isHobby ? <Heart size={19} /> : <Sparkles size={19} />}</div>
              <span>{isHobby ? "Hobby" : "Namaz"}</span>
            </button>
          );
        }
        const isActive = tb.key === "more" ? isMoreActive : active === tb.key;
        return (
          <button key={tb.key} onClick={() => onNav(tb.key)} className={`tab-item ${isActive ? "active" : ""}`}>
            <div className="tab-pill"><tb.icon size={19} /></div>
            <span>{tb.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
/* ---------------- HABITS ---------------- */
function HabitsView({ state, api, push }) {
  const [draft, setDraft] = useState("");
  const key = todayKey();
  const week = weekStartingSunday();
  const add = () => { if (!draft.trim()) return; api.addHabit(draft.trim()); setDraft(""); push("Habit added", "success"); };
  return (
    <div className="anim-fadeUp">
      <div style={{ marginBottom: 16 }}><h1 className="greeting-title" style={{ fontSize: 24 }}>Habits</h1><div className="t-sm t-sub">Build good habits daily</div></div>
      <Card style={{ marginBottom: 16 }}>
        <div className="row g-2">
          <Input placeholder="e.g. Read 10 pages, No sugar" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
          <Btn variant="ghost" icon onClick={add}><Plus size={14} /></Btn>
        </div>
      </Card>
      {state.habits.length === 0 ? (
        <EmptyState icon={<Leaf size={32} />} title="No habits yet" sub="Add a small daily habit and start building your streak." />
      ) : (
        <div className="col g-3">
          {state.habits.map((h) => {
            const streak = computeStreak((k) => !!h.doneDates[k]);
            return (
              <Card key={h.id}>
                <div className="row-between" style={{ marginBottom: 10 }}>
                  <div className="bold t-sm">{h.name}</div>
                  <div className="row g-2" style={{ alignItems: "center" }}>
                    {streak > 0 && <Badge tone="warning"><Flame size={11} /> {streak}d</Badge>}
                    <button className="icon-btn" style={{ width: 26, height: 26, border: "none", background: "transparent" }} onClick={() => api.deleteHabit(h.id)}><Trash2 size={13} /></button>
                  </div>
                </div>
                <div className="row g-2">
                  {week.map((k) => {
                    const done = !!h.doneDates[k]; const isToday = k === key;
                    return (
                      <button key={k} disabled={!isToday} className="namaz-pill" style={{ opacity: isToday ? 1 : 0.6, background: done ? "var(--accent)" : undefined, color: done ? "#fff" : undefined, cursor: isToday ? "pointer" : "default", border: "none" }} onClick={() => isToday && api.toggleHabitToday(h.id)}>
                        {done ? <Check size={13} /> : <span className="t-xs">{dayLabel1(k)}</span>}
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- MOOD ---------------- */
const MOOD_OPTIONS = [
  { key: "great", emoji: "😄", label: "Great" },
  { key: "good", emoji: "🙂", label: "Good" },
  { key: "okay", emoji: "😐", label: "Okay" },
  { key: "low", emoji: "😔", label: "Low" },
  { key: "bad", emoji: "😢", label: "Bad" },
];
function moodEmoji(k) { return (MOOD_OPTIONS.find((m) => m.key === k) || {}).emoji || "•"; }
function MoodView({ state, api, push }) {
  const key = todayKey();
  const [note, setNote] = useState("");
  const todays = state.mood.logs.find((l) => l.date === key);
  const week = weekStartingSunday();
  const history = state.mood.logs.slice().sort((a, b) => b.date < a.date ? -1 : 1).slice(0, 14);
  const save = (mood) => { api.logMood(mood, note); push("Mood logged", "success"); };
  return (
    <div className="anim-fadeUp">
      <div style={{ marginBottom: 16 }}><h1 className="greeting-title" style={{ fontSize: 24 }}>Mood</h1><div className="t-sm t-sub">Track your mood</div></div>
      <Card style={{ marginBottom: 16 }}>
        <div className="section-label">How are you feeling today?</div>
        <div className="row-between" style={{ marginTop: 10 }}>
          {MOOD_OPTIONS.map((m) => (
            <button key={m.key} onClick={() => save(m.key)} className="col center g-1" style={{ background: "none", border: "none", padding: 6, opacity: todays && todays.mood === m.key ? 1 : 0.55 }}>
              <span style={{ fontSize: 28 }}>{m.emoji}</span>
              <span className="t-xs t-faint">{m.label}</span>
            </button>
          ))}
        </div>
        <textarea className="input" style={{ marginTop: 12, minHeight: 70, width: "100%" }} placeholder="Add a note (optional)" value={todays ? (note || todays.note) : note} onChange={(e) => setNote(e.target.value)} onBlur={() => todays && api.logMood(todays.mood, note)} />
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div className="section-label">This Week</div>
        <div className="row-between" style={{ marginTop: 8 }}>
          {week.map((k) => { const l = state.mood.logs.find((x) => x.date === k); return (
            <div key={k} className="col g-1" style={{ alignItems: "center" }}>
              <span style={{ fontSize: 18, opacity: l ? 1 : 0.25 }}>{l ? moodEmoji(l.mood) : "•"}</span>
              <span className={`t-xs ${k === key ? "bold" : "t-faint"}`}>{dayLabel1(k)}</span>
            </div>
          ); })}
        </div>
      </Card>
      <Card>
        <div className="section-label">History</div>
        {history.length === 0 ? <div className="t-xs t-sub">No mood logs yet.</div> : (
          <div className="col g-2">
            {history.map((l) => (
              <div key={l.id} className="row g-3" style={{ alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid var(--divider)" }}>
                <span style={{ fontSize: 18 }}>{moodEmoji(l.mood)}</span>
                <div className="col g-1" style={{ minWidth: 0 }}>
                  <span className="t-xs t-faint">{prettyDate(l.date)}</span>
                  {l.note && <span className="t-sm">{l.note}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------- HEALTH ---------------- */
const HEALTH_TAGS = ["Headache", "Fatigue", "Energetic", "Sore", "Sick", "Feeling Good"];
function HealthView({ state, api, push }) {
  const [weight, setWeight] = useState("");
  const [tags, setTags] = useState([]);
  const [note, setNote] = useState("");
  const logs = state.health.logs;
  const weightLogs = logs.filter((l) => l.weight).slice().sort((a, b) => a.date < b.date ? -1 : 1);
  const latest = weightLogs[weightLogs.length - 1];
  const prev = weightLogs[weightLogs.length - 2];
  const delta = latest && prev ? Math.round((latest.weight - prev.weight) * 10) / 10 : null;
  const toggleTag = (t) => setTags((cur) => cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]);
  const save = () => {
    if (!weight && tags.length === 0 && !note.trim()) { push("Add a weight, tag, or note first", "danger"); return; }
    api.logHealth({ weight: weight ? Number(weight) : null, tags, note: note.trim() });
    setWeight(""); setTags([]); setNote("");
    push("Health entry saved", "success");
  };
  return (
    <div className="anim-fadeUp">
      <div style={{ marginBottom: 16 }}><h1 className="greeting-title" style={{ fontSize: 24 }}>Health</h1><div className="t-sm t-sub">Monitor your health</div></div>
      {latest && (
        <Card style={{ marginBottom: 16 }}>
          <div className="row-between">
            <div><div style={{ fontSize: 26, fontWeight: 800 }}>{latest.weight} kg</div><div className="t-xs t-sub">Latest weight · {prettyDate(latest.date)}</div></div>
            {delta !== null && <Badge tone={delta > 0 ? "danger" : delta < 0 ? "success" : "default"}>{delta > 0 ? "+" : ""}{delta} kg</Badge>}
          </div>
        </Card>
      )}
      <Card style={{ marginBottom: 16 }}>
        <div className="section-label">Log Entry</div>
        <Field label="Weight (kg, optional)"><Input type="number" placeholder="e.g. 68.5" value={weight} onChange={(e) => setWeight(e.target.value)} /></Field>
        <Field label="How are you feeling?">
          <div className="row g-2" style={{ flexWrap: "wrap" }}>
            {HEALTH_TAGS.map((t) => <Chip key={t} active={tags.includes(t)} onClick={() => toggleTag(t)}>{t}</Chip>)}
          </div>
        </Field>
        <Field label="Note (optional)"><Input placeholder="Anything else to note..." value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        <Btn block onClick={save}><Check size={15} /> Save Entry</Btn>
      </Card>
      <Card>
        <div className="section-label">History</div>
        {logs.length === 0 ? <div className="t-xs t-sub">No entries yet.</div> : (
          <div className="col g-2">
            {logs.map((l) => (
              <div key={l.id} className="row-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--divider)" }}>
                <div className="col g-1">
                  <span className="t-xs t-faint">{prettyDate(l.date)}</span>
                  <span className="t-sm">{l.weight ? `${l.weight} kg` : ""}{l.tags && l.tags.length ? `${l.weight ? " · " : ""}${l.tags.join(", ")}` : ""}</span>
                  {l.note && <span className="t-xs t-sub">{l.note}</span>}
                </div>
                <button className="icon-btn" style={{ width: 26, height: 26, border: "none", background: "transparent" }} onClick={() => api.deleteHealthLog(l.id)}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

const MORE_SECTIONS = [
  { title: "Priority Essentials", items: [
    { key: "tasks", label: "Tasks", icon: CheckSquare, color: "#4E9BE0" },
    { key: "study", label: "Study", icon: BookOpen, color: "#8A6FD1" },
    { key: "goals", label: "Goals", icon: Target, color: "#E0B23E" },
    { key: "namaz", label: "Namaz", icon: Sparkles, color: "#4F9A6C" },
    { key: "statistics", label: "Stats", icon: BarChart3, color: "#4E9BE0" },
    { key: "calendar", label: "Calendar", icon: CalendarDays, color: "#E0A23E" },
  ] },
  { title: "Daily Life", items: [
    { key: "pomodoro", label: "Focus Timer", icon: TimerIcon, color: "#4E9BE0" },
    { key: "habits", label: "Habits", icon: Leaf, color: "#4F9A6C" },
    { key: "sleep", label: "Sleep", icon: Moon, color: "#6C7FD8" },
    { key: "water", label: "Water", icon: Droplet, color: "#3E9FD8" },
    { key: "journal", label: "Journal", icon: Feather, color: "#E0A23E" },
    { key: "notes", label: "Notes", icon: StickyNote, color: "#E0A23E" },
    { key: "reminders", label: "Reminders", icon: BellRing, color: "#E0B23E" },
    { key: "mood", label: "Mood", icon: Heart, color: "#DA5470" },
    { key: "health", label: "Health", icon: ShieldCheck, color: "#DA5470" },
  ] },
  { title: "Personal Growth", items: [
    { key: "profile", label: "Levels", icon: Star, color: "#E0B23E", soon: true },
    { key: "achieve", label: "Achievements", icon: Trophy, color: "#8A6FD1", soon: true },
    { key: "courses", label: "Courses", icon: BookOpen, color: "#8A6FD1", soon: true },
    { key: "books", label: "Books", icon: BookOpen, color: "#E0A23E", soon: true },
    { key: "trading", label: "Trading", icon: TrendingUp, color: "#4F9A6C" },
    { key: "money", label: "Money", icon: Wallet, color: "#4F9A6C" },
  ] },
];
function MoreHub({ onNav, push, lastNH }) {
  const sections = MORE_SECTIONS.map((section) => {
    if (section.title !== "Priority Essentials") return section;
    return { ...section, items: section.items.map((it) => it.key === "namaz" ? (lastNH === "hobby" ? { key: "hobby", label: "Hobby", icon: Heart, color: "#DA5470" } : it) : it) };
  });
  return (
    <div className="anim-fadeUp">
      <div className="row-between" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="greeting-title">More</h1>
          <div className="greeting-sub">Everything in one place</div>
        </div>
        <button className="icon-btn" onClick={() => onNav("settings")}><SettingsIcon size={17} /></button>
      </div>
      {sections.map((section) => (
        <div key={section.title} style={{ marginBottom: 20 }}>
          <div className="section-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 3, height: 13, borderRadius: 2, background: "var(--accent)", display: "inline-block" }} />
            {section.title}
          </div>
          <div className="grid grid-3" style={{ marginTop: 10 }}>
            {section.items.map((m) => (
              <Card
                key={m.key}
                tap
                className="col center g-2 more-tile"
                style={{ alignItems: "center", padding: "20px 8px", cursor: "pointer", opacity: m.soon ? 0.72 : 1, position: "relative" }}
                onClick={() => m.soon ? push(`${m.label} is coming soon`, "default") : onNav(m.key)}
              >
                {m.soon && <span className="more-tile-soon">Soon</span>}
                <div className="more-tile-icon" style={{ background: `color-mix(in srgb, ${m.color} 30%, transparent)`, color: m.color, boxShadow: `0 0 18px color-mix(in srgb, ${m.color} 45%, transparent)` }}>
                  <m.icon size={19} />
                </div>
                <div className="t-sm bold">{m.label}</div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Mobile drawer (hamburger menu) ---------------- */
function Drawer({ open, onClose, active, onNav }) {
  if (!open) return null;
  return createPortal(
    <div className="modal-scrim anim-fadeIn" style={{ justifyContent: "flex-start" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card-strong" style={{ width: 260, height: "100vh", borderRadius: "0 24px 24px 0", padding: "20px", paddingTop: "calc(20px + env(safe-area-inset-top, 24px))", overflowY: "auto", boxSizing: "border-box" }}>
        <div className="brand-row">
          <img src={LOGO_IMAGE} alt="HayatOS" className="brand-logo" />
          <div className="brand-name">HayatOS</div>
        </div>
        <nav className="col g-1">
          {[...TABS.filter((t) => t.key !== "more"), ...MORE_TABS].map((tb) => (
            <a key={tb.key} className={`nav-item ${active === tb.key ? "active" : ""}`} onClick={() => { onNav(tb.key); onClose(); }}>
              <tb.icon size={17} /><span>{tb.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>,
    document.body
  );
}

function FloatingBackButton({ onBack }) {
  return createPortal(
    <button className="float-back liquid-glass" onClick={() => { hapticTap(); onBack(); }} aria-label="Back">
      <ChevronLeft size={20} />
    </button>,
    document.body
  );
}

function ThemeSwitch({ theme, onSet }) {
  const opts = [
    { key: "light", icon: Sun, label: "Light" },
    { key: "dark", icon: Moon, label: "Dark" },
    { key: "auto", icon: Palette, label: "Auto" },
  ];
  return (
    <div className="row g-2">
      {opts.map((o) => (
        <button key={o.key} onClick={() => onSet(o.key)} className={`chip liquid-glass ${theme === o.key ? "active" : ""}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <o.icon size={13} /> {o.label}
        </button>
      ))}
    </div>
  );
}
/* ============================================================
   DASHBOARD — matches reference: greeting+date, progress card,
   4 stat tiles, task checklist, namaz + daily-goal row
   ============================================================ */
function taskIconFor(category) {
  const c = (category || "").toLowerCase();
  if (c.includes("study")) return BookOpen;
  if (c.includes("grow") || c.includes("trad")) return TrendingUp;
  if (c.includes("spirit") || c.includes("namaz") || c.includes("deen")) return Sparkles;
  if (c.includes("game") || c.includes("personal")) return Gamepad2;
  return CheckSquare;
}

function Dashboard({ state, api, onNav, push, lastNH }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const iv = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(iv); }, []);
  const key = todayKey();
  const todayTasks = state.tasks.filter(isTaskForToday);
  const done = todayTasks.filter((x) => x.completed).length, total = todayTasks.length;
  const overallPct = total ? Math.round((done / total) * 100) : 0;
  const score = Math.round(dayScore(key, state));
  const isGood = (k) => dayScore(k, state) >= 60;
  const streak = computeStreak(isGood);
  const goalsDone = state.goals.filter((g) => g.progress >= 100).length;

  const nd = state.namaz[key];
  const namazDone = nd ? PRAYERS.filter((p) => nd[p]).length : 0;
  const isHobby = lastNH === "hobby";
  const hobbiesDone = state.hobbies.filter((h) => h.done).length;
  const hobbyList = state.hobbies.slice(0, 5);

  return (
    <div className="anim-fadeUp">
      <div className="row-between" style={{ marginBottom: 18, alignItems: "flex-start" }}>
        <div>
          <div className="greeting-sub">{greeting()}{state.profile.name ? "," : ""}</div>
          <h1 className="greeting-title">{state.profile.name || "Friend"} <Sparkles size={20} className="sparkle" style={{ display: "inline", verticalAlign: "middle" }} /></h1>
          <div className="greeting-sub" style={{ marginTop: 6 }}>May your day be productive and full of barakah.</div>
        </div>
        <div className="date-badge">
          <div className="num">{String(now.getDate()).padStart(2, "0")}</div>
          <div className="txt">{now.toLocaleDateString(undefined, { month: "short" })} {now.getFullYear()}<br />{now.toLocaleDateString(undefined, { weekday: "long" })}</div>
        </div>
      </div>

      <Card strong className="progress-card" style={{ marginBottom: 16 }}>
        <div className="row-between">
          <div className="bold t-lg">Today's Progress</div>
          <div className="pct">{overallPct}%</div>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${overallPct}%` }} /></div>
        <div className="row-between">
          <div className="t-sm t-sub">Keep going! You're doing great.</div>
          <button className="icon-btn" onClick={() => onNav("tasks")}><ArrowRight size={16} /></button>
        </div>
      </Card>

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <Card className="stat-tile" tap onClick={() => onNav("statistics")}>
          <div className="stat-icon" style={{ background: "var(--tile-1-bg)", color: "var(--tile-1-fg)" }}><Flame size={19} /></div>
          <div className="stat-num">{streak}</div>
          <div className="stat-label">Day Streak</div>
        </Card>
        <Card className="stat-tile" tap onClick={() => onNav("statistics")}>
          <div className="stat-icon" style={{ background: "var(--tile-2-bg)", color: "var(--tile-2-fg)" }}><Star size={19} /></div>
          <div className="stat-num">{score}</div>
          <div className="stat-label">Focus Score</div>
        </Card>
        <Card className="stat-tile" tap onClick={() => onNav("goals")}>
          <div className="stat-icon" style={{ background: "var(--tile-3-bg)", color: "var(--tile-3-fg)" }}><Target size={19} /></div>
          <div className="stat-num">{goalsDone}/{state.goals.length}</div>
          <div className="stat-label">Goals</div>
        </Card>
        <Card className="stat-tile" tap onClick={() => onNav("tasks")}>
          <div className="stat-icon" style={{ background: "var(--tile-4-bg)", color: "var(--tile-4-fg)" }}><Check size={19} /></div>
          <div className="stat-num">{done}</div>
          <div className="stat-label">Tasks Done</div>
        </Card>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div className="row-between" style={{ marginBottom: 4 }}>
          <div className="bold t-lg">Today's Tasks</div>
          <button className="fab" onClick={() => onNav("tasks", { addTask: true })}><Plus size={17} /></button>
        </div>
        {todayTasks.length === 0 ? (
          <div className="t-sm t-sub" style={{ padding: "14px 2px" }}>No tasks for today yet — tap + to add one.</div>
        ) : todayTasks.slice(0, 6).map((t) => {
          const Icon = taskIconFor(t.category);
          const tc = tagColor(t.category);
          return (
            <div key={t.id} className="task-row">
              <button className={`task-check ${t.completed ? "done" : ""}`} onClick={() => api.toggleTask(t.id)}>{t.completed && <Check size={14} />}</button>
              <div className="task-icon"><Icon size={16} /></div>
              <div className="flex-1">
                <div className={`task-title ${t.completed ? "done" : ""}`}>{t.title}</div>
                <span className="task-tag" style={{ background: tc.bg, color: tc.fg }}>{t.category}</span>
              </div>
              {t.dueDate && <div className="task-time">{prettyDate(t.dueDate)}</div>}
              <button className="icon-btn" style={{ width: 30, height: 30, border: "none", background: "transparent" }} onClick={() => onNav("tasks")}><MoreVertical size={15} /></button>
            </div>
          );
        })}
      </Card>

      <div className="grid grid-2">
        <Card tap onClick={() => onNav(isHobby ? "hobby" : "namaz")}>
          <div className="row-between" style={{ marginBottom: 2 }}>
            <div className="bold t-sm">{isHobby ? "Hobbies" : "Namaz"}</div>
            <Badge>{isHobby ? `${hobbiesDone}/${state.hobbies.length}` : `${namazDone}/5`}</Badge>
          </div>
          <div className="namaz-row">
            {isHobby
              ? (hobbyList.length ? hobbyList.map((h) => (
                  <div key={h.id} className={`namaz-pill ${h.done ? "done" : ""}`}><Heart size={15} /></div>
                )) : Array.from({ length: 5 }).map((_, i) => <div key={i} className="namaz-pill"><Heart size={15} /></div>))
              : PRAYERS.map((p) => (
                  <div key={p} className={`namaz-pill ${nd && nd[p] ? "done" : ""}`}><Sparkles size={15} /></div>
                ))}
          </div>
          <div className="t-xs t-sub center">
            {isHobby
              ? (state.hobbies.length ? (hobbiesDone === state.hobbies.length ? "All done" : `${state.hobbies.length - hobbiesDone} left`) : "Add a hobby")
              : (namazDone === 5 ? "All done" : `${5 - namazDone} left`)}
          </div>
        </Card>
        <Card tap onClick={() => onNav("tasks")} className="col center g-2" style={{ alignItems: "center" }}>
          <div className="row-between" style={{ width: "100%" }}><div className="bold t-sm">Daily Goal</div></div>
          <ProgressRing value={overallPct} size={72} stroke={7} label={`${overallPct}%`} />
          <div className="t-xs t-sub center">{done}/{total || 0} tasks</div>
        </Card>
      </div>

      <Card style={{ marginTop: 16 }}>
        <div className="section-label">Motivation</div>
        <div className="t-lg bold" style={{ fontFamily: "'Newsreader', serif", lineHeight: 1.5 }}>"{quoteOfDay()}"</div>
      </Card>
    </div>
  );
}
/* ============================================================
   TASKS
   ============================================================ */
const PRIORITIES = ["High", "Medium", "Low"];
const PRIORITY_TONE = { High: "danger", Medium: "warning", Low: "default" };
const REPEATS = ["None", "Daily", "Weekly", "Monthly"];
const CATEGORIES = ["Study", "Growth", "Spiritual", "Personal", "General"];
const emptyTaskDraft = () => ({ title: "", description: "", priority: "Medium", category: "General", startDate: todayKey(), dueDate: todayKey(), repeat: "None", progress: 0, notes: "", tags: "" });

function TaskForm({ initial, onCancel, onSave, push }) {
  const [d, setD] = useState(initial);
  const set = (k) => (e) => setD((s) => ({ ...s, [k]: e.target.value }));
  return (
    <>
      <Field label="Title"><Input autoFocus placeholder="e.g. Finish chapter 4 notes" value={d.title} onChange={set("title")} /></Field>
      <Field label="Description"><TextArea placeholder="Optional details..." value={d.description} onChange={set("description")} /></Field>
      <div className="grid grid-2">
        <Field label="Priority"><Select value={d.priority} onChange={set("priority")}>{PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}</Select></Field>
        <Field label="Category"><Select value={d.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</Select></Field>
      </div>
      <Field label="Schedule">
        <div className="row g-2" style={{ marginBottom: 8 }}>
          {[["Today", 0], ["Tomorrow", 1], ["Day After", 2]].map(([lbl, off]) => (
            <button key={lbl} type="button" className="chip" onClick={() => { const k = addDays(todayKey(), off); setD((s) => ({ ...s, startDate: k, dueDate: k })); }}>{lbl}</button>
          ))}
        </div>
        <div className="grid grid-2">
          <Field label="Start Date"><DateField value={d.startDate || d.dueDate} onChange={(v) => setD((s) => ({ ...s, startDate: v, dueDate: s.dueDate && s.dueDate >= v ? s.dueDate : v }))} /></Field>
          <Field label="End Date"><DateField value={d.dueDate || d.startDate} onChange={(v) => setD((s) => ({ ...s, dueDate: v }))} /></Field>
        </div>
        <div className="t-xs t-faint" style={{ marginTop: 6 }}>Task shows only between these dates. Same date for both = single-day task.</div>
      </Field>
      <div className="grid grid-2">
        <Field label="Repeat"><Select value={d.repeat} onChange={set("repeat")}>{REPEATS.map((r) => <option key={r} value={r}>{r}</option>)}</Select></Field>
      </div>
      <Field label={`Progress — ${d.progress}%`}><input type="range" min="0" max="100" value={d.progress} onChange={(e) => setD((s) => ({ ...s, progress: Number(e.target.value) }))} style={{ width: "100%" }} /></Field>
      <Field label="Tags (comma separated)"><Input placeholder="urgent, deep-work" value={d.tags} onChange={set("tags")} /></Field>
      <Field label="Notes"><TextArea placeholder="Extra notes..." value={d.notes} onChange={set("notes")} /></Field>
      <div className="row g-3" style={{ paddingTop: 4 }}>
        <Btn variant="ghost" block onClick={onCancel}>Cancel</Btn>
        <Btn block onClick={() => {
          if (!d.title.trim()) { push("Title is required", "danger"); return; }
          onSave({ ...d, tags: d.tags.split(",").map((x) => x.trim()).filter(Boolean) });
        }}><Check size={16} /> Save Task</Btn>
      </div>
    </>
  );
}

function TaskRow({ task, api, onEdit, push }) {
  const [justDone, setJustDone] = useState(false);
  const toggle = () => { if (!task.completed) { setJustDone(true); setTimeout(() => setJustDone(false), 450); } api.toggleTask(task.id); };
  const overdue = task.dueDate && !task.completed && task.dueDate < todayKey();
  const Icon = taskIconFor(task.category);
  const tc = tagColor(task.category);
  return (
    <Card className="anim-fadeUp" style={{ opacity: task.completed ? 0.6 : 1 }}>
      <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
        <button className={`task-check ${task.completed ? "done" : ""}`} style={justDone ? { animation: "popCheck .4s ease" } : {}} onClick={toggle}>{task.completed && <Check size={14} />}</button>
        <div className="task-icon"><Icon size={16} /></div>
        <div className="flex-1">
          <div className="row-between">
            <div className={`task-title ${task.completed ? "done" : ""}`}>{task.title}</div>
            <div className="row g-1">
              <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => api.toggleTaskFavorite(task.id)}><Star size={13} fill={task.favorite ? "#e0b23e" : "none"} color={task.favorite ? "#e0b23e" : "currentColor"} /></button>
              <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => onEdit(task)}><Edit2 size={13} /></button>
              <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => { api.deleteTask(task.id); push("Task deleted"); }}><Trash2 size={13} /></button>
            </div>
          </div>
          {task.description && <div className="t-sm t-sub" style={{ marginTop: 2 }}>{task.description}</div>}
          <div className="row wrap g-2" style={{ marginTop: 8 }}>
            <span className="task-tag" style={{ background: tc.bg, color: tc.fg }}>{task.category}</span>
            <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
            {task.repeat !== "None" && <Badge>{task.repeat}</Badge>}
            {task.dueDate && <Badge tone={overdue ? "danger" : "default"}>{prettyDate(task.dueDate)}</Badge>}
            {task.tags.map((tg) => <span key={tg} className="badge">#{tg}</span>)}
          </div>
          {task.progress > 0 && !task.completed && <div style={{ marginTop: 10 }}><ProgressBar value={task.progress} thin /></div>}
        </div>
      </div>
    </Card>
  );
}

const TASK_STATUS_TABS = ["All", "Today", "Upcoming", "Completed", "Missed"];
const SORT_MODES = [["dueDate", "Due Date"], ["priority", "Priority"], ["title", "Title"]];
const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };
function Tasks({ state, api, push, prefill, onNav }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [sortMode, setSortMode] = useState("dueDate");
  const [modal, setModal] = useState(prefill ? "new" : null);
  const key = todayKey();

  let filtered = state.tasks.filter((x) => {
    if (status === "Today" && !isTaskForToday(x)) return false;
    if (status === "Upcoming" && !(!x.completed && x.dueDate && x.dueDate > key)) return false;
    if (status === "Completed" && !x.completed) return false;
    if (status === "Missed" && !(!x.completed && x.dueDate && x.dueDate < key)) return false;
    if (priority !== "All" && x.priority !== priority) return false;
    if (query && !`${x.title} ${x.description} ${x.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
  filtered = filtered.slice().sort((a, b) => {
    if (sortMode === "priority") return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (sortMode === "title") return a.title.localeCompare(b.title);
    return (a.dueDate || "9999") < (b.dueDate || "9999") ? -1 : 1;
  });

  const completed = state.tasks.filter((x) => x.completed).length;
  const missed = state.tasks.filter((x) => !x.completed && x.dueDate && x.dueDate < key).length;
  const total = state.tasks.length || 1;
  const pending = state.tasks.length - completed - missed;
  const completionPct = Math.round((completed / total) * 100);

  const save = (draft) => {
    if (modal && modal !== "new") api.updateTask(modal.id, draft);
    else api.addTask(draft);
    setModal(null);
    push(modal && modal !== "new" ? "Task updated" : "Task added", "success");
  };
  const cycleSort = () => { const i = SORT_MODES.findIndex(([m]) => m === sortMode); setSortMode(SORT_MODES[(i + 1) % SORT_MODES.length][0]); };
  const sortLabel = SORT_MODES.find(([m]) => m === sortMode)[1];
  const stopSwipe = { onTouchStart: (e) => e.stopPropagation(), onTouchMove: (e) => e.stopPropagation(), onTouchEnd: (e) => e.stopPropagation() };

  return (
    <div className="anim-fadeUp">
      <div className="row-between" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="greeting-title" style={{ fontSize: 24 }}>Tasks</h1>
          <div className="t-sm t-sub">Plan. Focus. Complete.</div>
        </div>
        <div className="row g-2">
          <button className="icon-btn" onClick={() => push("Achievements is coming soon", "default")} title="Achieve"><Trophy size={17} /></button>
          <Btn onClick={() => setModal("new")}><Plus size={16} /> Add</Btn>
        </div>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div className="row g-3" style={{ alignItems: "center" }}>
          <ProgressRing value={completionPct} size={68} stroke={7} label={`${completed}/${state.tasks.length}`} />
          <div className="row-between" style={{ flex: 1 }}>
            <div className="col g-1" style={{ alignItems: "center" }}><span className="bold t-lg">{pending}</span><span className="t-xs t-faint">Pending</span></div>
            <div className="col g-1" style={{ alignItems: "center" }}><span className="bold t-lg" style={{ color: missed ? "var(--danger)" : "inherit" }}>{missed}</span><span className="t-xs t-faint">Missed</span></div>
            <div className="col g-1" style={{ alignItems: "center" }}><span className="bold t-lg" style={{ color: "var(--success)" }}>{completionPct}%</span><span className="t-xs t-faint">Completion</span></div>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div className="row g-2" style={{ marginBottom: 12 }}>
          <Search size={16} className="t-faint" />
          <input placeholder="Search tasks, tags, notes..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", fontSize: 14, flex: 1, color: "var(--text-1)" }} />
          <button className="icon-btn" style={{ width: 30, height: 30, border: "none", background: "transparent" }} onClick={cycleSort} title={`Sort: ${sortLabel}`}><List size={15} /></button>
        </div>
        <div className="quick-tools-row" style={{ marginBottom: 8 }} {...stopSwipe}>
          {TASK_STATUS_TABS.map((s) => <button key={s} className={`chip-scroll ${status === s ? "active" : ""}`} onClick={() => setStatus(s)}>{s}</button>)}
        </div>
        <div className="row wrap g-2">
          {["All", ...PRIORITIES].map((p) => <Chip key={p} active={priority === p} onClick={() => setPriority(p)}>{p}</Chip>)}
        </div>
        <div className="t-xs t-faint" style={{ marginTop: 8 }}>Sorted by {sortLabel}</div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={<CheckSquare size={38} />} title="No tasks here" sub="Add a task to start building today's board." />
      ) : (
        <StackList items={filtered} onReorder={api.reorderTasks} renderItem={(x) => <TaskRow task={x} api={api} onEdit={setModal} push={push} />} />
      )}

      {modal && (
        <Modal title={modal === "new" ? "New Task" : "Edit Task"} onClose={() => setModal(null)}>
          <TaskForm push={push} initial={modal === "new" ? emptyTaskDraft() : { ...modal, tags: modal.tags.join(", ") }} onCancel={() => setModal(null)} onSave={save} />
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   GOALS
   ============================================================ */
function GoalForm({ initial, onCancel, onSave, push }) {
  const [d, setD] = useState(initial);
  const [msDraft, setMsDraft] = useState("");
  const addMs = () => { if (!msDraft.trim()) return; setD((s) => ({ ...s, milestones: [...s.milestones, { id: uid(), text: msDraft.trim(), done: false }] })); setMsDraft(""); };
  const toggleMs = (id) => setD((s) => ({ ...s, milestones: s.milestones.map((m) => m.id === id ? { ...m, done: !m.done, completedAt: !m.done ? Date.now() : null } : m) }));
  const removeMs = (id) => setD((s) => ({ ...s, milestones: s.milestones.filter((m) => m.id !== id) }));
  return (
    <>
      <Field label="Goal Title"><Input autoFocus placeholder="e.g. 12th Exam" value={d.title} onChange={(e) => setD((s) => ({ ...s, title: e.target.value }))} /></Field>
      <div className="grid grid-2">
        <Field label="Target"><Input placeholder="e.g. 90% or ₹1,00,000" value={d.target || ""} onChange={(e) => setD((s) => ({ ...s, target: e.target.value }))} /></Field>
        <Field label="Deadline"><DateField value={d.deadline} onChange={(v) => setD((s) => ({ ...s, deadline: v }))} /></Field>
      </div>
      <Field label={`Progress — ${d.progress}%`}><input type="range" min="0" max="100" value={d.progress} onChange={(e) => setD((s) => ({ ...s, progress: Number(e.target.value) }))} style={{ width: "100%" }} /></Field>
      <Field label="Milestones">
        <div className="col g-2">
          {d.milestones.map((m) => (
            <div key={m.id} className="row g-2">
              <input type="checkbox" checked={m.done} onChange={() => toggleMs(m.id)} style={{ width: 16, height: 16 }} />
              <span className="flex-1 t-sm" style={{ textDecoration: m.done ? "line-through" : "none", color: m.done ? "var(--text-3)" : "var(--text-1)" }}>{m.text}</span>
              <button onClick={() => removeMs(m.id)} className="t-faint" style={{ background: "none", border: "none" }}><Trash2 size={13} /></button>
            </div>
          ))}
          <div className="row g-2">
            <Input placeholder="Add a milestone..." value={msDraft} onChange={(e) => setMsDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMs())} />
            <Btn variant="ghost" icon onClick={addMs}><Plus size={14} /></Btn>
          </div>
        </div>
      </Field>
      <Field label="Notes"><TextArea value={d.notes} onChange={(e) => setD((s) => ({ ...s, notes: e.target.value }))} /></Field>
      <div className="row g-3" style={{ paddingTop: 4 }}>
        <Btn variant="ghost" block onClick={onCancel}>Cancel</Btn>
        <Btn block onClick={() => {
          if (!d.title.trim()) { push("Title is required", "danger"); return; }
          const progress = d.milestones.length ? Math.round((d.milestones.filter((m) => m.done).length / d.milestones.length) * 100) : d.progress;
          onSave({ ...d, progress });
        }}><Check size={16} /> Save Goal</Btn>
      </div>
    </>
  );
}

/* ============================================================
   ACHIEVE
   ============================================================ */
function Achieve({ state, api, push }) {
  const now = Date.now();
  const [modal, setModal] = useState(null);
  const showCompleted = state.prefs?.showCompletedTasks !== false;
  const items = state.tasks
    .map((t) => ({ t, archivedAt: taskArchivedAt(t) }))
    .filter((x) => x.archivedAt !== null)
    .filter((x) => showCompleted || !x.t.completed)
    .sort((a, b) => b.archivedAt - a.archivedAt);
  const doneCount = items.filter((x) => x.t.completed).length;
  const missedCount = items.length - doneCount;
  const saveEdit = (draft) => { api.updateTask(modal.id, draft); setModal(null); push("Task updated", "success"); };
  return (
    <div className="anim-fadeUp">
      <div style={{ marginBottom: 18 }}>
        <h1 className="greeting-title" style={{ fontSize: 24 }}>Achieve</h1>
        <div className="t-sm t-sub">{doneCount} done · {missedCount} missed · done tasks clear after 30 days{!showCompleted ? " · completed hidden" : ""}</div>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={<Trophy size={38} />} title="Nothing here yet" sub="Completed tasks stay 30 days; missed tasks stay until you remove them." />
      ) : (
        <div className="col g-3">
          {items.map(({ t, archivedAt }) => {
            const daysLeft = Math.max(0, 30 - Math.floor((now - archivedAt) / DAY_MS));
            const Icon = taskIconFor(t.category);
            return (
              <Card key={t.id}>
                <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
                  <div className="task-icon"><Icon size={16} /></div>
                  <div className="flex-1">
                    <div className="row-between">
                      <div className="task-title" style={{ textDecoration: t.completed ? "line-through" : "none" }}>{t.title}</div>
                      <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => { api.deleteTask(t.id); push("Removed"); }}><Trash2 size={13} /></button>
                    </div>
                    <div className="row wrap g-2" style={{ marginTop: 8 }}>
                      <Badge tone={t.completed ? "success" : "danger"}>{t.completed ? "Done" : "Missed"}</Badge>
                      {t.dueDate && <Badge>{prettyDate(t.dueDate)}</Badge>}
                      {t.completed ? <span className="t-xs t-faint">expires in {daysLeft}d</span> : <span className="t-xs t-faint">kept until you clear it</span>}
                    </div>
                    {!t.completed && (
                      <div className="row g-2" style={{ marginTop: 10 }}>
                        <Btn variant="ghost" onClick={() => { api.toggleTask(t.id); push("Marked done", "success"); }}><Check size={14} /> Mark Done</Btn>
                        <Btn variant="ghost" onClick={() => setModal(t)}><Edit2 size={14} /> Edit</Btn>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {modal && (
        <Modal title="Edit Task" onClose={() => setModal(null)}>
          <TaskForm push={push} initial={{ ...modal, tags: modal.tags.join(", ") }} onCancel={() => setModal(null)} onSave={saveEdit} />
        </Modal>
      )}
    </div>
  );
}

const GOAL_TABS = ["Active", "Completed", "Archived"];
function Goals({ state, api, push }) {
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState("Active");
  const empty = () => ({ title: "", progress: 0, deadline: "", notes: "", milestones: [], target: "", status: "active" });
  const save = (d) => { if (modal && modal !== "new") api.updateGoal(modal.id, d); else api.addGoal(d); setModal(null); push("Goal saved", "success"); };

  const withPace = state.goals.map((g) => ({ ...g, pace: goalPaceStatus(g) }));
  const activeGoals = withPace.filter((g) => (g.status || "active") === "active" && g.pace !== "completed");
  const completedGoals = withPace.filter((g) => (g.status || "active") === "completed" || g.pace === "completed");
  const archivedGoals = withPace.filter((g) => g.status === "archived");
  const visible = tab === "Active" ? activeGoals : tab === "Completed" ? completedGoals : archivedGoals;

  const onTrackCount = activeGoals.filter((g) => g.pace === "onTrack").length;
  const atRiskCount = activeGoals.filter((g) => g.pace === "atRisk").length;
  const onTrackPct = activeGoals.length ? Math.round((onTrackCount / activeGoals.length) * 100) : 0;
  const atRiskPct = activeGoals.length ? Math.round((atRiskCount / activeGoals.length) * 100) : 0;

  const recentMilestones = state.goals
    .flatMap((g) => (g.milestones || []).filter((m) => m.done && m.completedAt).map((m) => ({ ...m, goalTitle: g.title })))
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, 5);

  return (
    <div className="anim-fadeUp">
      <div className="row-between" style={{ marginBottom: 16 }}>
        <div><h1 className="greeting-title" style={{ fontSize: 24 }}>Goals</h1><div className="t-sm t-sub">Set goals. Achieve more.</div></div>
        <Btn onClick={() => setModal("new")}><Plus size={16} /> New Goal</Btn>
      </div>

      <div className="quick-tools-row" style={{ marginBottom: 16 }}>
        {GOAL_TABS.map((t) => <button key={t} className={`chip-scroll ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={<Target size={38} />} title={`No ${tab.toLowerCase()} goals`} sub="Set a goal — exams, trading, savings, anything — and track it to 100%." />
      ) : (
        <div className="col g-3" style={{ marginBottom: 16 }}>
          {visible.map((g) => {
            const paceMeta = GOAL_PACE_META[g.pace];
            return (
              <Card key={g.id} tap onClick={() => setModal(g)}>
                <div className="row-between">
                  <div className="bold truncate">{g.title}</div>
                  <div className="row g-2" style={{ alignItems: "center" }}>
                    <Badge tone={paceMeta.tone}>{paceMeta.label}</Badge>
                    <button onClick={(e) => { e.stopPropagation(); api.deleteGoal(g.id); push("Goal deleted"); }} className="t-faint" style={{ background: "none", border: "none" }}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div style={{ margin: "12px 0 6px" }}><ProgressBar value={g.progress} /></div>
                <div className="row-between t-xs t-sub">
                  <span>{g.progress}% complete{g.target ? ` · Target: ${g.target}` : ""}</span>{g.deadline && <span>Due {prettyDate(g.deadline)}</span>}
                </div>
                {g.milestones.length > 0 && <div className="t-xs t-faint" style={{ marginTop: 8 }}>{g.milestones.filter((m) => m.done).length}/{g.milestones.length} milestones done</div>}
                {tab !== "Archived" && (
                  <div className="row g-2" style={{ marginTop: 10 }}>
                    {g.status !== "archived" && <button className="t-xs bold" style={{ background: "none", border: "none", color: "var(--text-3)" }} onClick={(e) => { e.stopPropagation(); api.setGoalStatus(g.id, "archived"); push("Goal archived"); }}>Archive</button>}
                  </div>
                )}
                {tab === "Archived" && <button className="t-xs bold" style={{ marginTop: 10, background: "none", border: "none", color: "var(--accent)" }} onClick={(e) => { e.stopPropagation(); api.setGoalStatus(g.id, "active"); push("Goal restored", "success"); }}>Restore</button>}
              </Card>
            );
          })}
        </div>
      )}

      <Card style={{ marginBottom: 16 }}>
        <div className="section-label">Goal Overview</div>
        <div className="grid grid-4" style={{ gap: 8, marginTop: 8 }}>
          <div className="col g-1" style={{ alignItems: "center" }}><span className="bold t-lg">{activeGoals.length}</span><span className="t-xs t-faint" style={{ textAlign: "center" }}>Total Active</span></div>
          <div className="col g-1" style={{ alignItems: "center" }}><span className="bold t-lg" style={{ color: "var(--success)" }}>{onTrackCount}</span><span className="t-xs t-faint" style={{ textAlign: "center" }}>On Track {onTrackPct}%</span></div>
          <div className="col g-1" style={{ alignItems: "center" }}><span className="bold t-lg" style={{ color: "var(--danger)" }}>{atRiskCount}</span><span className="t-xs t-faint" style={{ textAlign: "center" }}>At Risk {atRiskPct}%</span></div>
          <div className="col g-1" style={{ alignItems: "center" }}><span className="bold t-lg">{completedGoals.length}</span><span className="t-xs t-faint" style={{ textAlign: "center" }}>Completed</span></div>
        </div>
      </Card>

      <Card>
        <div className="section-label">Recent Milestones</div>
        {recentMilestones.length === 0 ? <div className="t-xs t-sub">No milestones completed yet.</div> : (
          <div className="col g-2">
            {recentMilestones.map((m) => (
              <div key={m.id} className="row-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--divider)" }}>
                <div className="row g-2" style={{ alignItems: "center", minWidth: 0 }}>
                  <span className="prayer-row-icon" style={{ background: "color-mix(in srgb, var(--success) 20%, transparent)", color: "var(--success)" }}><Check size={13} /></span>
                  <div className="col g-1" style={{ minWidth: 0 }}><span className="t-sm bold truncate">{m.text}</span><span className="t-xs t-faint">{m.goalTitle}</span></div>
                </div>
                <span className="t-xs t-faint">{timeAgo(m.completedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {modal && <Modal title={modal === "new" ? "New Goal" : "Edit Goal"} onClose={() => setModal(null)}><GoalForm push={push} initial={modal === "new" ? empty() : modal} onCancel={() => setModal(null)} onSave={save} /></Modal>}
    </div>
  );
}
/* ============================================================
   NAMAZ
   ============================================================ */
function fmtClock12(d) {
  const m = d.getMinutes();
  if (RUNTIME_PREFS.timeFormat === "24h") return `${String(d.getHours()).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  let h = d.getHours(); const pm = h >= 12; h = ((h + 11) % 12) + 1;
  return `${h}:${String(m).padStart(2, "0")} ${pm ? "PM" : "AM"}`;
}
function nextPrayerInfo(times) {
  const order = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (const p of order) {
    const [h, m] = (times[p] || "00:00").split(":").map(Number);
    const mins = h * 60 + m;
    if (mins > nowMin) return { prayer: p, diffMin: mins - nowMin };
  }
  const [h, m] = (times.fajr || "04:00").split(":").map(Number);
  return { prayer: "fajr", diffMin: (24 * 60 - nowMin) + h * 60 + m, tomorrow: true };
}
function currentWaqtInfo(times) {
  const order = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let current = "isha";
  for (const p of order) {
    const [h, m] = (times[p] || "00:00").split(":").map(Number);
    if (h * 60 + m <= nowMin) current = p; else break;
  }
  return current;
}
const PRAYER_ICON = { fajr: Moon, dhuhr: Sun, asr: Sun, maghrib: Sun, isha: Moon };
const QUICK_TOOLS = [
  { key: "qibla", label: "Qibla Finder", icon: Compass, color: "#4F9A6C", soon: true },
  { key: "__times", label: "Prayer Times", icon: Clock, color: "#3E86C9" },
  { key: "tasbih", label: "Tasbih Counter", icon: Disc, color: "#B5813B" },
  { key: "duas", label: "Dua List", icon: BookOpen, color: "#C68A3D" },
  { key: "surahs", label: "Surah List", icon: List, color: "#8F5E22" },
  { key: "__masjid", label: "Masjid Finder", icon: MapPin, color: "#D14A34" },
];
function prevPrayerMinutes(times, nextPrayer) {
  const order = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const idx = order.indexOf(nextPrayer);
  const prev = idx > 0 ? order[idx - 1] : "isha";
  const [h, m] = (times[prev] || "00:00").split(":").map(Number);
  return h * 60 + m;
}
function Namaz({ state, api, push, onNav }) {
  const key = todayKey();
  const today = state.namaz[key] || {};
  const doneToday = PRAYERS.filter((p) => today[p]).length;
  const allDone = doneToday === 5;
  const week = weekStartingSunday(), month = lastNDays(30);
  const isComplete = (k) => { const d = state.namaz[k]; return !!d && PRAYERS.every((p) => d[p]); };
  const streak = computeStreak(isComplete);
  const longest = Math.max(streak, computeLongest(isComplete, month));
  const monthPct = Math.round((month.filter(isComplete).length / month.length) * 100);
  const times = state.namazTimes;
  const [draftTimes, setDraftTimes] = useState(times);
  const [showTimes, setShowTimes] = useState(false);
  const [, tick] = useState(0);
  useEffect(() => { const iv = setInterval(() => tick((x) => x + 1), 30000); return () => clearInterval(iv); }, []);
  const nowClock = new Date();
  const next = nextPrayerInfo(times);
  const nh = Math.floor(next.diffMin / 60), nm = next.diffMin % 60;
  const activeWaqt = currentWaqtInfo(times);

  const openQuickTool = (toolKey) => {
    hapticTap();
    if (toolKey === "__times") { setDraftTimes(times); setShowTimes(true); return; }
    if (toolKey === "__masjid") { const url = "https://www.google.com/maps/search/mosques+near+me"; if (isNative()) { Browser.open({ url }).catch(() => {}); } else { try { window.open(url, "_blank"); } catch (e) {} } return; }
    if (toolKey === "qibla") { push("Qibla Finder is coming soon", "default"); return; }
    onNav && onNav(toolKey);
  };
  const stopSwipe = { onTouchStart: (e) => e.stopPropagation(), onTouchMove: (e) => e.stopPropagation(), onTouchEnd: (e) => e.stopPropagation() };

  return (

    <div className="anim-fadeUp">
      <div className="row-between" style={{ marginBottom: 18 }}>
        <div><h1 className="greeting-title" style={{ fontSize: 24 }}>Namaz Tracker</h1><div className="t-sm t-sub">Stay consistent, stay blessed.</div></div>
        <div className="col g-2" style={{ alignItems: "flex-end" }}>
          <Badge tone={streak > 0 ? "success" : "default"}><Flame size={13} /> {streak}-day streak</Badge>
          <HobbyCylinder side="namaz" onSwitch={(dest) => onNav && onNav(dest)} />
        </div>
      </div>

      {/* Next Prayer */}
      <Card strong className="prayer-hero" style={{ marginBottom: 16 }}>
        <div className="row-between" style={{ alignItems: "center" }}>
          <div className="col g-1">
            <div className="t-xs t-sub" style={{ textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 800 }}>Next Prayer</div>
            <div style={{ fontSize: 30, fontWeight: 800, fontFamily: "'Newsreader',serif" }}>{PRAYER_LABEL[next.prayer]}{next.tomorrow ? <span className="t-sm t-sub"> (tomorrow)</span> : null}</div>
            <div className="t-lg bold" style={{ color: "var(--accent)" }}>{fmtClock12(new Date(0, 0, 0, ...(times[next.prayer] || "0:0").split(":").map(Number)))}</div>
            <div className="row g-2" style={{ alignItems: "center", marginTop: 2 }}>
              <Clock size={13} className="t-faint" />
              <span className="t-sm t-sub">{nh > 0 ? `${nh}h ` : ""}{nm}m left</span>
            </div>
            <Btn variant="ghost" glass className="btn-sm" style={{ marginTop: 12, width: "fit-content" }} onClick={() => { setDraftTimes(times); setShowTimes(true); }}>
              View All Prayer Times <ArrowRight size={14} />
            </Btn>
          </div>
          <div className="ring-wrap" style={{ width: 118, height: 118, position: "relative" }}>
            <ProgressRing value={(doneToday / 5) * 100} size={118} stroke={10} label=" " glow={allDone} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 26, lineHeight: 1 }}>🕌</span>
              <span className="t-xs bold" style={{ marginTop: 4 }}>{doneToday}/5</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Tools */}
      <div className="quick-tools-row" style={{ marginBottom: 16 }} {...stopSwipe}>
        {QUICK_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button key={tool.label} className="quick-tool-btn liquid-glass" style={{ position: "relative", opacity: tool.soon ? 0.72 : 1 }} onClick={() => openQuickTool(tool.key)}>
              {tool.soon && <span className="more-tile-soon" style={{ top: 2, right: 2 }}>Soon</span>}
              <span className="quick-tool-icon" style={{ background: `color-mix(in srgb, ${tool.color} 30%, transparent)`, color: tool.color }}>
                <Icon size={19} />
              </span>
              <span className="t-xs bold quick-tool-label">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Today's Prayers */}
      <Card style={{ marginBottom: 16 }}>
        <div className="row-between" style={{ marginBottom: 10 }}>
          <div className="section-label" style={{ margin: 0 }}>Today's Prayers</div>
          <div className="t-xs t-sub">{prettyDate(key)}</div>
        </div>
        <div className="col g-1">
          {PRAYERS.map((p) => {
            const Icon = PRAYER_ICON[p];
            const isNext = p === next.prayer && !next.tomorrow;
            return (
              <button
                key={p}
                onClick={() => { api.toggleNamaz(key, p); hapticTap(); }}
                className={`prayer-row ${today[p] ? "prayer-row-done" : ""} ${isNext ? "prayer-row-active" : ""}`}
              >
                <span className="prayer-row-icon"><Icon size={14} /></span>
                <span className="row" style={{ flex: 1, minWidth: 0, justifyContent: "space-between", gap: 8 }}>
                  <span className="bold t-sm">{PRAYER_LABEL[p]}</span>
                  <span className="t-xs t-sub">{fmtClock12(new Date(0, 0, 0, ...(times[p] || "0:0").split(":").map(Number)))}</span>
                </span>
                {today[p] ? (
                  <span className="namaz-pill done"><Check size={11} /></span>
                ) : isNext ? (
                  <Badge>Upcoming</Badge>
                ) : (
                  <span className="namaz-pill" />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Analytics */}
      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <Card style={{ padding: 20 }}>
          <div className="section-label" style={{ fontSize: 13, marginBottom: 4 }}>Weekly Progress</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 78, marginTop: 14 }}>
            {week.map((k) => {
              const done = state.namaz[k] ? PRAYERS.filter((p) => state.namaz[k][p]).length : 0;
              const isToday = k === key;
              return (
                <div key={k} className="col g-2" style={{ flex: 1, alignItems: "center" }}>
                  <div className="week-bar-track">
                    <div className="week-bar-fill" style={{ height: `${(done / 5) * 100}%`, opacity: isToday ? 1 : 0.75 }} />
                  </div>
                  <span className={`t-xs ${isToday ? "bold" : "t-faint"}`} style={isToday ? { color: "var(--accent)" } : {}}>{dayLabel1(k)}</span>
                </div>
              );
            })}
          </div>
          <div className="row-between" style={{ marginTop: 14 }}>
            <span className="t-xs t-sub">Longest streak <b className="t-sub">{longest}d</b></span>
            <span className="t-xs t-sub">Current <b style={{ color: "var(--accent)" }}>{streak}d</b></span>
          </div>
        </Card>
        <Card style={{ padding: 20 }}>
          <div className="row-between"><div className="section-label" style={{ margin: 0, fontSize: 13 }}>Monthly Overview</div><span className="t-xs bold" style={{ color: "var(--accent)" }}>{monthPct}%</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 6, marginTop: 14 }}>
            {month.map((k) => {
              const cnt = state.namaz[k] ? PRAYERS.filter((p) => state.namaz[k][p]).length : 0;
              const bg = cnt === 5 ? "var(--accent)" : cnt >= 2 ? "color-mix(in srgb, var(--accent) 40%, var(--divider))" : "var(--divider)";
              return <div key={k} title={`${k}: ${cnt}/5`} style={{ aspectRatio: "1", borderRadius: 6, background: bg }} />;
            })}
          </div>
          <div className="row g-3" style={{ marginTop: 12, flexWrap: "wrap" }}>
            <span className="t-xs t-faint row g-1" style={{ alignItems: "center" }}><span style={{ width: 8, height: 8, borderRadius: 3, background: "var(--accent)", display: "inline-block" }} /> Full (5)</span>
            <span className="t-xs t-faint row g-1" style={{ alignItems: "center" }}><span style={{ width: 8, height: 8, borderRadius: 3, background: "color-mix(in srgb, var(--accent) 40%, var(--divider))", display: "inline-block" }} /> Partial</span>
            <span className="t-xs t-faint row g-1" style={{ alignItems: "center" }}><span style={{ width: 8, height: 8, borderRadius: 3, background: "var(--divider)", display: "inline-block" }} /> Missed</span>
          </div>
        </Card>
      </div>

      {/* Daily reminder */}
      <Card className="liquid-glass" style={{ marginBottom: 16 }}>
        <div className="row g-3" style={{ alignItems: "center" }}>
          <span className="prayer-row-icon" style={{ width: 44, height: 44 }}><BookOpen size={19} /></span>
          <div className="col g-1" style={{ flex: 1, minWidth: 0 }}>
            <div className="t-xs bold" style={{ color: "var(--accent)" }}>Daily Reminder</div>
            <div className="t-sm" style={{ lineHeight: 1.4 }}>Prayer guards the heart from wrongdoing — keep it close today.</div>
          </div>
          <Btn variant="ghost" glass className="btn-sm" onClick={() => { api.setPref("prayerReminders", true); push("Prayer reminders are on", "success"); }}>
            <Bell size={14} /> Remind
          </Btn>
        </div>
      </Card>

      {showTimes && (
        <Modal title="Prayer Times" onClose={() => setShowTimes(false)} footer={
          <Btn block onClick={() => { api.setNamazTimes(draftTimes); push("Prayer times updated", "success"); setShowTimes(false); }}><Check size={15} /> Save Times</Btn>
        }>
          <div className="t-xs t-sub" style={{ marginBottom: 4 }}>Set your local prayer times — HayatOS will notify you at each one.</div>
          <div className="grid grid-2" style={{ gap: 10 }}>
            {PRAYERS.map((p) => (
              <Field key={p} label={PRAYER_LABEL[p]}><TimeField value={draftTimes[p]} onChange={(v) => setDraftTimes((t) => ({ ...t, [p]: v }))} /></Field>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Tasbih Counter ---------------- */
const TASBIH_TARGETS = [33, 99, 100, 500];
function TasbihView({ state, api }) {
  const t = state.tasbih || { count: 0, target: 33 };
  const rounds = Math.floor(t.count / t.target);
  const remainder = t.count % t.target;
  return (
    <div className="anim-fadeUp col g-4" style={{ alignItems: "center", paddingTop: 8 }}>
      <div className="col center g-1">
        <h1 className="greeting-title" style={{ fontSize: 22 }}>Tasbih Counter</h1>
        <div className="t-sm t-sub">Dhikr, one tap at a time.</div>
      </div>
      <Card strong className="col center g-2" style={{ alignItems: "center", padding: 26, width: "100%" }}>
        <div className="t-xs t-sub" style={{ textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 800 }}>{rounds > 0 ? `${rounds} round${rounds > 1 ? "s" : ""} completed` : "Keep going"}</div>
        <div style={{ fontSize: 56, fontWeight: 800, fontFamily: "'Newsreader',serif", color: "var(--accent)" }}>{t.count}</div>
        <div className="t-sm t-sub">{remainder}/{t.target} this round</div>
      </Card>
      <button className="tasbih-tap liquid-glass" onClick={() => api.incTasbih()}>
        <Disc size={40} />
        <span className="t-sm bold" style={{ marginTop: 4 }}>Tap to count</span>
      </button>
      <div className="row g-2" style={{ flexWrap: "wrap", justifyContent: "center" }}>
        {TASBIH_TARGETS.map((n) => (
          <Chip key={n} active={t.target === n} onClick={() => api.setTasbihTarget(n)}>{n}</Chip>
        ))}
      </div>
      <Btn variant="ghost" glass onClick={() => api.resetTasbih()}><RotateCcw size={15} /> Reset Count</Btn>
    </div>
  );
}

/* ---------------- Dua List ---------------- */
const DUAS = [
  { title: "Before Eating", occasion: "Meals", arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ", transliteration: "Bismillahi wa 'ala barakatillah", translation: "In the name of Allah, and with the blessing of Allah." },
  { title: "After Eating", occasion: "Meals", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ", transliteration: "Alhamdu lillahil-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah", translation: "Praise be to Allah who fed me this and provided it for me without any strength or power on my part." },
  { title: "Before Sleeping", occasion: "Night", arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", transliteration: "Bismika Allahumma amutu wa ahya", translation: "In Your name, O Allah, I die and I live." },
  { title: "Upon Waking", occasion: "Morning", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur", translation: "Praise be to Allah who gave us life after having taken it from us, and unto Him is the resurrection." },
  { title: "Entering the Home", occasion: "Home", arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا", transliteration: "Bismillahi walajna wa bismillahi kharajna wa 'ala Allahi rabbina tawakkalna", translation: "In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we place our trust." },
  { title: "Leaving the Home", occasion: "Home", arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", transliteration: "Bismillahi tawakkaltu 'ala Allahi wa la hawla wa la quwwata illa billah", translation: "In the name of Allah, I place my trust in Allah; there is no power nor strength except with Allah." },
  { title: "Entering the Masjid", occasion: "Masjid", arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", transliteration: "Allahumma iftah li abwaba rahmatik", translation: "O Allah, open the doors of Your mercy for me." },
  { title: "Leaving the Masjid", occasion: "Masjid", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ", transliteration: "Allahumma inni as'aluka min fadlik", translation: "O Allah, I ask You from Your bounty." },
  { title: "For Travel", occasion: "Travel", arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ", transliteration: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun", translation: "Glory to Him who has subjected this to us, for we could never have accomplished it ourselves. And to our Lord we shall return." },
  { title: "Sayyidul Istighfar", occasion: "Forgiveness", arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ", transliteration: "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu", translation: "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, and I hold to Your covenant and promise as best I can." },
];
function DuaListView() {
  return (
    <div className="anim-fadeUp">
      <h1 className="greeting-title" style={{ fontSize: 22, marginBottom: 4 }}>Dua List</h1>
      <div className="t-sm t-sub" style={{ marginBottom: 16 }}>Everyday supplications, organized by occasion.</div>
      <div className="col g-3">
        {DUAS.map((d) => (
          <Card key={d.title}>
            <div className="row-between" style={{ gap: 8, marginBottom: 10 }}>
              <span className="bold t-sm">{d.title}</span>
              <Badge>{d.occasion}</Badge>
            </div>
            <div className="dua-arabic">{d.arabic}</div>
            <div className="dua-translation">{d.translation}</div>
            <div className="dua-transliteration">{d.transliteration}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Surah List ---------------- */
const SURAHS = [
  [1,"الفاتحة","Al-Fatihah","The Opening",7],[2,"البقرة","Al-Baqarah","The Cow",286],[3,"آل عمران","Aal-E-Imran","The Family of Imran",200],
  [4,"النساء","An-Nisa","The Women",176],[5,"المائدة","Al-Ma'idah","The Table Spread",120],[6,"الأنعام","Al-An'am","The Cattle",165],
  [7,"الأعراف","Al-A'raf","The Heights",206],[8,"الأنفال","Al-Anfal","The Spoils of War",75],[9,"التوبة","At-Tawbah","The Repentance",129],
  [10,"يونس","Yunus","Jonah",109],[11,"هود","Hud","Hud",123],[12,"يوسف","Yusuf","Joseph",111],
  [13,"الرعد","Ar-Ra'd","The Thunder",43],[14,"إبراهيم","Ibrahim","Abraham",52],[15,"الحجر","Al-Hijr","The Rocky Tract",99],
  [16,"النحل","An-Nahl","The Bee",128],[17,"الإسراء","Al-Isra","The Night Journey",111],[18,"الكهف","Al-Kahf","The Cave",110],
  [19,"مريم","Maryam","Mary",98],[20,"طه","Ta-Ha","Ta-Ha",135],[21,"الأنبياء","Al-Anbiya","The Prophets",112],
  [22,"الحج","Al-Hajj","The Pilgrimage",78],[23,"المؤمنون","Al-Mu'minun","The Believers",118],[24,"النور","An-Nur","The Light",64],
  [25,"الفرقان","Al-Furqan","The Criterion",77],[26,"الشعراء","Ash-Shu'ara","The Poets",227],[27,"النمل","An-Naml","The Ant",93],
  [28,"القصص","Al-Qasas","The Stories",88],[29,"العنكبوت","Al-Ankabut","The Spider",69],[30,"الروم","Ar-Rum","The Romans",60],
  [31,"لقمان","Luqman","Luqman",34],[32,"السجدة","As-Sajdah","The Prostration",30],[33,"الأحزاب","Al-Ahzab","The Combined Forces",73],
  [34,"سبأ","Saba","Sheba",54],[35,"فاطر","Fatir","The Originator",45],[36,"يس","Ya-Sin","Ya-Sin",83],
  [37,"الصافات","As-Saffat","Those Ranged in Ranks",182],[38,"ص","Sad","Sad",88],[39,"الزمر","Az-Zumar","The Troops",75],
  [40,"غافر","Ghafir","The Forgiver",85],[41,"فصلت","Fussilat","Explained in Detail",54],[42,"الشورى","Ash-Shura","The Consultation",53],
  [43,"الزخرف","Az-Zukhruf","The Ornaments of Gold",89],[44,"الدخان","Ad-Dukhan","The Smoke",59],[45,"الجاثية","Al-Jathiyah","The Kneeling",37],
  [46,"الأحقاف","Al-Ahqaf","The Sandhills",35],[47,"محمد","Muhammad","Muhammad",38],[48,"الفتح","Al-Fath","The Victory",29],
  [49,"الحجرات","Al-Hujurat","The Rooms",18],[50,"ق","Qaf","Qaf",45],[51,"الذاريات","Adh-Dhariyat","The Winnowing Winds",60],
  [52,"الطور","At-Tur","The Mount",49],[53,"النجم","An-Najm","The Star",62],[54,"القمر","Al-Qamar","The Moon",55],
  [55,"الرحمن","Ar-Rahman","The Most Merciful",78],[56,"الواقعة","Al-Waqi'ah","The Inevitable",96],[57,"الحديد","Al-Hadid","The Iron",29],
  [58,"المجادلة","Al-Mujadila","The Pleading Woman",22],[59,"الحشر","Al-Hashr","The Exile",24],[60,"الممتحنة","Al-Mumtahanah","She That Is Examined",13],
  [61,"الصف","As-Saff","The Ranks",14],[62,"الجمعة","Al-Jumu'ah","Friday",11],[63,"المنافقون","Al-Munafiqun","The Hypocrites",11],
  [64,"التغابن","At-Taghabun","Mutual Disillusion",18],[65,"الطلاق","At-Talaq","Divorce",12],[66,"التحريم","At-Tahrim","The Prohibition",12],
  [67,"الملك","Al-Mulk","The Sovereignty",30],[68,"القلم","Al-Qalam","The Pen",52],[69,"الحاقة","Al-Haqqah","The Reality",52],
  [70,"المعارج","Al-Ma'arij","The Ascending Stairways",44],[71,"نوح","Nuh","Noah",28],[72,"الجن","Al-Jinn","The Jinn",28],
  [73,"المزمل","Al-Muzzammil","The Enshrouded One",20],[74,"المدثر","Al-Muddaththir","The Cloaked One",56],[75,"القيامة","Al-Qiyamah","The Resurrection",40],
  [76,"الإنسان","Al-Insan","Man",31],[77,"المرسلات","Al-Mursalat","Those Sent Forth",50],[78,"النبأ","An-Naba","The Tidings",40],
  [79,"النازعات","An-Nazi'at","Those Who Drag Forth",46],[80,"عبس","Abasa","He Frowned",42],[81,"التكوير","At-Takwir","The Overthrowing",29],
  [82,"الإنفطار","Al-Infitar","The Cleaving",19],[83,"المطففين","Al-Mutaffifin","The Defrauding",36],[84,"الإنشقاق","Al-Inshiqaq","The Splitting Open",25],
  [85,"البروج","Al-Buruj","The Constellations",22],[86,"الطارق","At-Tariq","The Nightcomer",17],[87,"الأعلى","Al-A'la","The Most High",19],
  [88,"الغاشية","Al-Ghashiyah","The Overwhelming",26],[89,"الفجر","Al-Fajr","The Dawn",30],[90,"البلد","Al-Balad","The City",20],
  [91,"الشمس","Ash-Shams","The Sun",15],[92,"الليل","Al-Layl","The Night",21],[93,"الضحى","Ad-Duha","The Morning Hours",11],
  [94,"الشرح","Ash-Sharh","The Relief",8],[95,"التين","At-Tin","The Fig",8],[96,"العلق","Al-Alaq","The Clot",19],
  [97,"القدر","Al-Qadr","The Power",5],[98,"البينة","Al-Bayyinah","The Clear Proof",8],[99,"الزلزلة","Az-Zalzalah","The Earthquake",8],
  [100,"العاديات","Al-Adiyat","The Chargers",11],[101,"القارعة","Al-Qari'ah","The Calamity",11],[102,"التكاثر","At-Takathur","Rivalry in World Increase",8],
  [103,"العصر","Al-Asr","The Declining Day",3],[104,"الهمزة","Al-Humazah","The Traducer",9],[105,"الفيل","Al-Fil","The Elephant",5],
  [106,"قريش","Quraysh","Quraysh",4],[107,"الماعون","Al-Ma'un","Small Kindnesses",7],[108,"الكوثر","Al-Kawthar","Abundance",3],
  [109,"الكافرون","Al-Kafirun","The Disbelievers",6],[110,"النصر","An-Nasr","The Divine Support",3],[111,"المسد","Al-Masad","The Palm Fiber",5],
  [112,"الإخلاص","Al-Ikhlas","Sincerity",4],[113,"الفلق","Al-Falaq","The Daybreak",5],[114,"الناس","An-Nas","Mankind",6],
];
function SurahListView({ onNav }) {
  const [q, setQ] = useState("");
  const filtered = SURAHS.filter(([n, ar, translit, meaning]) => translit.toLowerCase().includes(q.toLowerCase()) || meaning.toLowerCase().includes(q.toLowerCase()) || String(n).includes(q));
  return (
    <div className="anim-fadeUp">
      <h1 className="greeting-title" style={{ fontSize: 22, marginBottom: 4 }}>Surah List</h1>
      <div className="t-sm t-sub" style={{ marginBottom: 12 }}>All 114 surahs of the Qur'an.</div>
      <Input placeholder="Search surah..." value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 14 }} />
      <div className="col g-2">
        {filtered.map(([n, ar, translit, meaning, ayahs]) => (
          <Card key={n} tap onClick={() => onNav && onNav("surahDetail", { param: n })} className="row g-3" style={{ alignItems: "center", padding: "12px 16px", cursor: "pointer" }}>
            <span className="surah-num">{n}</span>
            <div className="col g-1" style={{ flex: 1, minWidth: 0, alignItems: "flex-start" }}>
              <span className="surah-arabic">{ar}</span>
              <span className="t-xs t-sub">{meaning}</span>
              <span className="bold t-sm">{translit}</span>
            </div>
            <span className="t-xs t-faint">{ayahs} ayahs</span>
            <ChevronRight size={16} className="t-faint" />
          </Card>
        ))}
      </div>
    </div>
  );
}

/* Full surah reader. Fetched live from api.alquran.cloud (Uthmani Arabic + Sahih
   International translation + transliteration) rather than hand-typed, since scripture
   accuracy matters and 114 surahs / 6,236 ayahs isn't something to retype from memory. */
function SurahDetailView({ onNav, surahNumber }) {
  const [state_, setState_] = useState("loading"); // loading | ready | error
  const [ayahs, setAyahs] = useState([]);
  const meta = SURAHS.find((s) => s[0] === surahNumber);

  useEffect(() => {
    let cancelled = false;
    setState_("loading"); setAyahs([]);
    (async () => {
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih,en.transliteration`);
        const json = await res.json();
        if (cancelled) return;
        if (json.code !== 200 || !json.data || json.data.length < 3) { setState_("error"); return; }
        const [arabicEd, transEd, translitEd] = json.data;
        const combined = arabicEd.ayahs.map((a, i) => ({
          number: a.numberInSurah,
          arabic: a.text,
          translation: transEd.ayahs[i] ? transEd.ayahs[i].text : "",
          transliteration: translitEd.ayahs[i] ? translitEd.ayahs[i].text : "",
        }));
        setAyahs(combined);
        setState_("ready");
      } catch (e) { if (!cancelled) setState_("error"); }
    })();
    return () => { cancelled = true; };
  }, [surahNumber]);

  if (!meta) return (
    <div className="anim-fadeUp col center g-2" style={{ paddingTop: 40 }}>
      <div className="t-sm t-sub">Surah not found.</div>
      <Btn variant="ghost" glass onClick={() => onNav && onNav("surahs")}>Back to Surah List</Btn>
    </div>
  );
  const [n, ar, translit, meaning] = meta;

  return (
    <div className="anim-fadeUp">
      <div className="col center g-1" style={{ alignItems: "center", textAlign: "center", marginBottom: 18 }}>
        <span className="surah-num" style={{ width: 34, height: 34, fontSize: 14 }}>{n}</span>
        <div className="surah-arabic" style={{ fontSize: 28, marginTop: 6 }}>{ar}</div>
        <div className="bold t-lg">{translit}</div>
        <div className="t-sm t-sub">{meaning}</div>
      </div>

      {state_ === "loading" && <div className="col center g-2" style={{ padding: "40px 0" }}><Loader2 size={24} className="anim-spin" /><span className="t-sm t-sub">Loading surah…</span></div>}
      {state_ === "error" && (
        <div className="col center g-2" style={{ padding: "30px 0" }}>
          <span className="t-sm t-sub">Couldn't load this surah — check your connection and try again.</span>
        </div>
      )}
      {state_ === "ready" && (
        <div className="col g-3">
          {ayahs.map((a) => (
            <Card key={a.number}>
              <div className="row-between" style={{ marginBottom: 8 }}>
                <span className="surah-num" style={{ width: 24, height: 24, fontSize: 10 }}>{a.number}</span>
              </div>
              <div className="dua-arabic">{a.arabic}</div>
              <div className="dua-translation">{a.translation}</div>
              <div className="dua-transliteration">{a.transliteration}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   HOBBY
   ============================================================ */
const HOBBY_CATEGORIES = [
  { key: "Creative", icon: Palette, color: "#B5813B" },
  { key: "Tech", icon: Code2, color: "#3E86C9" },
  { key: "Health", icon: Dumbbell, color: "#D14A34" },
  { key: "Outdoor", icon: Compass, color: "#4F9A6C" },
  { key: "Reading", icon: BookOpen, color: "#8A5A2B" },
];
function hobbyCategoryMeta(cat) { return HOBBY_CATEGORIES.find((c) => c.key === cat) || { key: cat || "Creative", icon: Heart, color: "#94815F" }; }
function hobbyTotalMinutes(h) { return (h.sessions || []).reduce((sum, s) => sum + (s.minutes || 0), 0); }
function hobbyDaySet(h) { return new Set((h.sessions || []).map((s) => s.date)); }
function hobbyStreak(h) { const days = hobbyDaySet(h); return computeStreak((k) => days.has(k)); }
function hobbyWeekMinutes(h) {
  const week = weekStartingSunday(); const set = {};
  (h.sessions || []).forEach((s) => { set[s.date] = (set[s.date] || 0) + s.minutes; });
  return week.reduce((sum, k) => sum + (set[k] || 0), 0);
}
function hobbyProgressPct(h) {
  const ms = h.milestones || [];
  if (h.goal && h.goal.targetMinutesPerWeek) return Math.min(100, Math.round((hobbyWeekMinutes(h) / h.goal.targetMinutesPerWeek) * 100));
  if (ms.length) return Math.round((ms.filter((m) => m.done).length / ms.length) * 100);
  return 0;
}

function Hobby({ state, api, push, onNav }) {
  const [cat, setCat] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ name: "", category: "Creative" });
  const hobbies = state.hobbies || [];
  const filtered = (cat === "All" ? hobbies : hobbies.filter((h) => (h.category || "Creative") === cat)).slice().sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
  const week = weekStartingSunday();
  const weekTotals = week.map((k) => hobbies.reduce((sum, h) => sum + (h.sessions || []).filter((s) => s.date === k).reduce((x, s) => x + s.minutes, 0), 0));
  const weekTotal = weekTotals.reduce((a, b) => a + b, 0);
  const maxDay = Math.max(1, ...weekTotals);
  const stopSwipe = { onTouchStart: (e) => e.stopPropagation(), onTouchMove: (e) => e.stopPropagation(), onTouchEnd: (e) => e.stopPropagation() };

  const openHobby = (id) => onNav && onNav("hobbyDetail", { param: id });
  const submitAdd = () => {
    if (!draft.name.trim()) { push("Enter a hobby name", "danger"); return; }
    api.addHobby({ name: draft.name.trim(), category: draft.category });
    setDraft({ name: "", category: "Creative" }); setShowAdd(false); push("Hobby added", "success");
  };

  return (
    <div className="anim-fadeUp">
      <div className="row-between" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="greeting-title" style={{ fontSize: 24 }}>Hobby</h1>
          <div className="t-sm t-sub">Discover. Learn. Enjoy.</div>
        </div>
        <div className="col g-2" style={{ alignItems: "flex-end" }}>
          <button className="icon-btn" onClick={() => setShowAdd(true)}><Plus size={17} /></button>
          <HobbyCylinder side="hobby" onSwitch={(dest) => onNav && onNav(dest)} />
        </div>
      </div>

      <div className="quick-tools-row" style={{ marginBottom: 16 }} {...stopSwipe}>
        <button className={`chip-scroll ${cat === "All" ? "active" : ""}`} onClick={() => setCat("All")}>All</button>
        {HOBBY_CATEGORIES.map((c) => (
          <button key={c.key} className={`chip-scroll ${cat === c.key ? "active" : ""}`} onClick={() => setCat(c.key)}>{c.key}</button>
        ))}
      </div>

      <div className="row-between" style={{ marginBottom: 10 }}>
        <div className="section-label" style={{ margin: 0 }}>My Hobbies</div>
        <span className="t-xs t-sub">{filtered.length} hobb{filtered.length === 1 ? "y" : "ies"}</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Heart size={30} />} title="No hobbies yet" sub="Add something you enjoy — HayatOS will help you track it." />
      ) : (
        <div className="grid grid-2" style={{ gap: 12, marginBottom: 16 }}>
          {filtered.map((h) => {
            const meta = hobbyCategoryMeta(h.category);
            const Icon = meta.icon;
            const pct = hobbyProgressPct(h);
            const total = hobbyTotalMinutes(h);
            const streak = hobbyStreak(h);
            return (
              <Card key={h.id} tap className="hobby-card" onClick={() => openHobby(h.id)}>
                <div className="row-between" style={{ alignItems: "flex-start" }}>
                  <span className="hobby-card-icon" style={{ background: `color-mix(in srgb, ${meta.color} 25%, transparent)`, color: meta.color }}><Icon size={20} /></span>
                  <button className="icon-btn" style={{ width: 26, height: 26, border: "none", background: "transparent" }} onClick={(e) => { e.stopPropagation(); api.toggleHobbyFavorite(h.id); }}>
                    <Heart size={15} fill={h.favorite ? "#e0607a" : "none"} color={h.favorite ? "#e0607a" : "var(--text-3)"} />
                  </button>
                </div>
                <div className="bold t-sm truncate" style={{ marginTop: 8 }}>{h.name}</div>
                {streak > 0 && <Badge tone="warning" style={{ marginTop: 4 }}><Flame size={11} /> {streak} Day Streak</Badge>}
                <div className="row-between" style={{ marginTop: 8, marginBottom: 3 }}>
                  <span className="t-xs t-sub bold">{pct}%</span>
                </div>
                <div className="hobby-progress-track"><div className="hobby-progress-fill" style={{ width: `${pct}%`, background: meta.color }} /></div>
                <div className="row-between" style={{ marginTop: 8 }}>
                  <span className="t-xs t-faint">{fmtHM(total)}</span>
                  <span className="t-xs t-faint">{(h.sessions || []).length} sessions</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card style={{ marginBottom: 16 }}>
        <div className="row g-3" style={{ alignItems: "center", marginBottom: 10 }}>
          <span className="prayer-row-icon"><TrendingUp size={16} /></span>
          <div>
            <div className="t-xs t-sub bold">This Week Overview</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{fmtHM(weekTotal)} <span className="t-xs t-sub" style={{ fontWeight: 500 }}>total hobby time</span></div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 56 }}>
          {week.map((k, i) => (
            <div key={k} className="col g-2" style={{ flex: 1, alignItems: "center" }}>
              <div className="week-bar-track" style={{ height: 42 }}>
                <div className="week-bar-fill" style={{ height: `${(weekTotals[i] / maxDay) * 100}%`, opacity: k === todayKey() ? 1 : 0.7 }} />
              </div>
              <span className={`t-xs ${k === todayKey() ? "bold" : "t-faint"}`} style={k === todayKey() ? { color: "var(--accent)" } : {}}>{dayLabel1(k)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="liquid-glass" style={{ marginBottom: 16 }}>
        <div className="row g-3" style={{ alignItems: "center" }}>
          <Star size={18} style={{ color: "var(--accent)" }} />
          <div>
            <div className="t-sm bold">Keep doing what you love.</div>
            <div className="t-xs t-sub">Consistency turns passion into progress.</div>
          </div>
        </div>
      </Card>

      {showAdd && (
        <Modal title="Add a Hobby" onClose={() => setShowAdd(false)} footer={<Btn block onClick={submitAdd}><Plus size={15} /> Add Hobby</Btn>}>
          <Field label="Name"><Input placeholder="e.g. Photography, Chess, Painting" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} /></Field>
          <Field label="Category">
            <div className="row g-2" style={{ flexWrap: "wrap" }}>
              {HOBBY_CATEGORIES.map((c) => <Chip key={c.key} active={draft.category === c.key} onClick={() => setDraft((d) => ({ ...d, category: c.key }))}>{c.key}</Chip>)}
            </div>
          </Field>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Hobby Detail ---------------- */
function HobbyDetailView({ state, api, push, onNav, hobbyId }) {
  const h = (state.hobbies || []).find((x) => x.id === hobbyId);
  const [showLog, setShowLog] = useState(false);
  const [logMin, setLogMin] = useState("30");
  const [logNote, setLogNote] = useState("");
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [, tick] = useState(0);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [milestoneDraft, setMilestoneDraft] = useState("");
  useEffect(() => { if (!running) return; const iv = setInterval(() => tick((x) => x + 1), 1000); return () => clearInterval(iv); }, [running]);

  if (!h) return (
    <div className="anim-fadeUp col center g-2" style={{ paddingTop: 40 }}>
      <div className="t-sm t-sub">Hobby not found.</div>
      <Btn variant="ghost" glass onClick={() => onNav && onNav("hobby")}>Back to Hobbies</Btn>
    </div>
  );

  const meta = hobbyCategoryMeta(h.category);
  const Icon = meta.icon;
  const total = hobbyTotalMinutes(h);
  const streak = hobbyStreak(h);
  const pct = hobbyProgressPct(h);
  const sessions = h.sessions || [];
  const week = weekStartingSunday();
  const weekTotals = week.map((k) => sessions.filter((s) => s.date === k).reduce((sum, s) => sum + s.minutes, 0));
  const maxDay = Math.max(1, ...weekTotals);
  const elapsedMin = running && startedAt ? Math.floor((Date.now() - startedAt) / 60000) : 0;

  const stopAndLog = () => {
    const mins = Math.max(1, elapsedMin);
    api.logHobbySession(h.id, { minutes: mins, note: "", date: todayKey() });
    setRunning(false); setStartedAt(null);
    push(`Logged ${mins}m for ${h.name}`, "success");
  };
  const submitLog = () => {
    const mins = parseInt(logMin, 10);
    if (!mins || mins <= 0) { push("Enter valid minutes", "danger"); return; }
    api.logHobbySession(h.id, { minutes: mins, note: logNote.trim(), date: todayKey() });
    setShowLog(false); setLogMin("30"); setLogNote(""); push("Session logged", "success");
  };
  const addMilestone = () => {
    if (!milestoneDraft.trim()) return;
    api.addHobbyMilestone(h.id, milestoneDraft.trim()); setMilestoneDraft("");
  };

  return (
    <div className="anim-fadeUp col g-4">
      <div className="col center g-2" style={{ alignItems: "center", textAlign: "center" }}>
        <span className="hobby-detail-icon" style={{ background: `color-mix(in srgb, ${meta.color} 25%, transparent)`, color: meta.color }}><Icon size={38} /></span>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{h.name}</div>
        <div className="t-sm t-sub">{h.category} · Keep building, keep growing.</div>
        <button className="icon-btn" onClick={() => api.toggleHobbyFavorite(h.id)}>
          <Heart size={15} fill={h.favorite ? "#e0607a" : "none"} color={h.favorite ? "#e0607a" : "var(--text-3)"} /> <span className="t-xs" style={{ marginLeft: 4 }}>{h.favorite ? "Favorited" : "Favorite"}</span>
        </button>
      </div>

      <div className="grid grid-2" style={{ gap: 10 }}>
        <Card className="col center g-1" style={{ padding: 14 }}><Flame size={17} style={{ color: "#e08a3e" }} /><span className="bold t-lg">{streak}</span><span className="t-xs t-sub">Day Streak</span></Card>
        <Card className="col center g-1" style={{ padding: 14 }}><Clock size={17} className="t-sub" /><span className="bold t-lg">{fmtHM(total)}</span><span className="t-xs t-sub">Total Time</span></Card>
        <Card className="col center g-1" style={{ padding: 14 }}><TrendingUp size={17} className="t-sub" /><span className="bold t-lg">{sessions.length}</span><span className="t-xs t-sub">Sessions</span></Card>
        <Card className="col center g-1" style={{ padding: 14 }}><Target size={17} className="t-sub" /><span className="bold t-lg">{pct}%</span><span className="t-xs t-sub">Progress</span></Card>
      </div>

      <Card>
        <div className="row-between" style={{ marginBottom: 12 }}><div className="section-label" style={{ margin: 0 }}>Progress This Week</div></div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 70 }}>
          {week.map((k, i) => (
            <div key={k} className="col g-2" style={{ flex: 1, alignItems: "center" }}>
              <div className="week-bar-track">
                <div className="week-bar-fill" style={{ height: `${(weekTotals[i] / maxDay) * 100}%`, background: `linear-gradient(180deg, ${meta.color}, var(--accent-2))`, opacity: k === todayKey() ? 1 : 0.7 }} />
              </div>
              <span className={`t-xs ${k === todayKey() ? "bold" : "t-faint"}`}>{dayLabel1(k)}</span>
            </div>
          ))}
        </div>
      </Card>

      {running ? (
        <Card strong className="col center g-2" style={{ alignItems: "center", padding: 22 }}>
          <div className="t-xs t-sub" style={{ textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 800 }}>Session Running</div>
          <div style={{ fontSize: 34, fontWeight: 800, fontFamily: "'Newsreader',serif", color: "var(--accent)" }}>{elapsedMin}m</div>
          <Btn onClick={stopAndLog}><Check size={15} /> Stop & Log</Btn>
        </Card>
      ) : (
        <div className="row g-2">
          <Btn className="flex-1" onClick={() => { setRunning(true); setStartedAt(Date.now()); }}><Sparkles size={15} /> Start Session</Btn>
          <Btn variant="ghost" glass className="flex-1" onClick={() => setShowLog(true)}><Clock size={15} /> Log Time</Btn>
        </div>
      )}

      <Card>
        <div className="row-between" style={{ marginBottom: 10 }}>
          <div className="section-label" style={{ margin: 0 }}>Recent Sessions</div>
          {sessions.length > 3 && <button className="t-xs bold" style={{ color: "var(--accent)", background: "none", border: "none" }} onClick={() => setShowFullHistory((v) => !v)}>{showFullHistory ? "Show Less" : "View All"}</button>}
        </div>
        {sessions.length === 0 ? (
          <div className="t-xs t-sub" style={{ padding: "10px 0" }}>No sessions logged yet.</div>
        ) : (
          <div className="col g-2">
            {(showFullHistory ? sessions : sessions.slice(0, 3)).map((s) => (
              <div key={s.id} className="row-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--divider)" }}>
                <div className="col g-1">
                  <span className="t-sm bold">{fmtHM(s.minutes)}{s.note ? ` · ${s.note}` : ""}</span>
                  <span className="t-xs t-faint">{prettyDate(s.date)}</span>
                </div>
                <button className="icon-btn" style={{ width: 26, height: 26, border: "none", background: "transparent" }} onClick={() => api.deleteHobbySession(h.id, s.id)}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="section-label" style={{ marginBottom: 10 }}>Goal & Milestones</div>
        <div className="row g-2" style={{ marginBottom: 12 }}>
          <div className="flex-1"><Input placeholder="Add a milestone..." value={milestoneDraft} onChange={(e) => setMilestoneDraft(e.target.value)} /></div>
          <button className="fab" style={{ width: 40, height: 40 }} onClick={addMilestone}><Plus size={16} /></button>
        </div>
        {(h.milestones || []).length === 0 ? (
          <div className="t-xs t-sub">No milestones yet — add one to track progress.</div>
        ) : (
          <div className="col g-2">
            {h.milestones.map((m) => (
              <div key={m.id} className="row g-2" style={{ alignItems: "center" }}>
                <button className={`task-check ${m.done ? "done" : ""}`} onClick={() => api.toggleHobbyMilestone(h.id, m.id)}>{m.done && <Check size={13} />}</button>
                <span className={`t-sm flex-1 ${m.done ? "t-faint" : ""}`} style={m.done ? { textDecoration: "line-through" } : {}}>{m.title}</span>
                <button className="icon-btn" style={{ width: 24, height: 24, border: "none", background: "transparent" }} onClick={() => api.deleteHobbyMilestone(h.id, m.id)}><X size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showLog && (
        <Modal title="Log Time" onClose={() => setShowLog(false)} footer={<Btn block onClick={submitLog}><Check size={15} /> Save Session</Btn>}>
          <Field label="Minutes"><Input type="number" value={logMin} onChange={(e) => setLogMin(e.target.value)} /></Field>
          <Field label="Note (optional)"><Input placeholder="e.g. C++ practice" value={logNote} onChange={(e) => setLogNote(e.target.value)} /></Field>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   STUDY
   ============================================================ */
const SUBJECT_ICON_PRESETS = [
  { match: /account/i, icon: Calculator, color: "#8A6FD1" },
  { match: /econom/i, icon: TrendingUp, color: "#4F9A6C" },
  { match: /business/i, icon: Briefcase, color: "#E0A23E" },
  { match: /computer|programming|\bcs\b/i, icon: Code2, color: "#3E86C9" },
  { match: /english|literature/i, icon: BookOpen, color: "#D14A5A" },
];
const SUBJECT_FALLBACK_COLORS = ["#8A6FD1", "#4F9A6C", "#E0A23E", "#3E86C9", "#D14A5A", "#B5813B"];
function subjectMeta(name, index = 0) {
  const preset = SUBJECT_ICON_PRESETS.find((p) => p.match.test(name || ""));
  if (preset) return preset;
  return { icon: BookOpen, color: SUBJECT_FALLBACK_COLORS[index % SUBJECT_FALLBACK_COLORS.length] };
}
function subjectTodayMinutes(subject, sessions) { const k = todayKey(); return sessions.filter((s) => s.subjectId === subject.id && s.date === k).reduce((a, s) => a + s.minutes, 0); }
function subjectTotalMinutes(subject, sessions) { return sessions.filter((s) => s.subjectId === subject.id).reduce((a, s) => a + s.minutes, 0); }
function subjectWeekMinutes(subject, sessions) { const week = weekStartingSunday(); return week.map((k) => sessions.filter((s) => s.subjectId === subject.id && s.date === k).reduce((a, s) => a + s.minutes, 0)); }
function subjectStreak(subject, sessions) { const days = new Set(sessions.filter((s) => s.subjectId === subject.id).map((s) => s.date)); return computeStreak((k) => days.has(k)); }
function subjectOverallProgress(subject) { const ch = subject.chapters || []; return ch.length ? Math.round(ch.reduce((a, c) => a + (c.progress || 0), 0) / ch.length) : 0; }
const CHAPTER_STATUS = { notStarted: { label: "Not Started", tone: "default" }, inProgress: { label: "In Progress", tone: "warning" }, completed: { label: "Completed", tone: "success" } };
function fileToDataUrl(file) { return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); }); }
function fmtFileSize(bytes) { if (!bytes) return ""; const kb = bytes / 1024; return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`; }
/* Saves the picked file into the device's private app storage (Directory.Data) via
   Capacitor Filesystem, so PDFs of any size live on-device instead of bloating Firestore.
   Firestore/state only ever stores the metadata + on-device path. Falls back to an
   in-memory data URL when running outside a native shell (e.g. browser preview). */
async function saveResourceFile(subjectId, file) {
  const sizeLabel = fmtFileSize(file.size);
  if (isNative()) {
    const dataUrl = await fileToDataUrl(file);
    const base64 = dataUrl.split(",")[1];
    const path = `hayatos/study/${subjectId}/${uid()}_${file.name}`;
    await Filesystem.mkdir({ path: `hayatos/study/${subjectId}`, directory: Directory.Data, recursive: true }).catch(() => {});
    await Filesystem.writeFile({ path, data: base64, directory: Directory.Data });
    return { title: file.name, sizeLabel, path, native: true };
  }
  const dataUrl = await fileToDataUrl(file);
  return { title: file.name, sizeLabel, dataUrl, native: false };
}
// Reads the PDF back out as a plain base64 string (no data: prefix) for the in-app viewer below.
async function getResourceBase64(r) {
  if (r.native && r.path) { const res = await Filesystem.readFile({ path: r.path, directory: Directory.Data }); return res.data; }
  if (r.dataUrl) return r.dataUrl.split(",")[1];
  throw new Error("File not available on this device");
}
async function deleteResourceFile(r) {
  if (r.native && r.path) { try { await Filesystem.deleteFile({ path: r.path, directory: Directory.Data }); } catch (e) {} }
}
function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
// pdf.js is loaded lazily, but now from a locally vendored copy (www/vendor/pdfjs)
// instead of a CDN, so PDFs render as real pages *inside* HayatOS even fully offline.
let pdfjsLoadPromise = null;
function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (pdfjsLoadPromise) return pdfjsLoadPromise;
  pdfjsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "./vendor/pdfjs/pdf.min.js";
    script.onload = () => {
      try {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "./vendor/pdfjs/pdf.worker.min.js";
        resolve(window.pdfjsLib);
      } catch (e) { reject(e); }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return pdfjsLoadPromise;
}
function PdfViewerModal({ title, base64, onClose }) {
  const canvasRef = useRef(null);
  const pdfRef = useRef(null);
  const viewportRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [rendering, setRendering] = useState(false);
  const [zoom, setZoom] = useState(1);
  const pan = useRef({ x: 0, y: 0 });
  const [, forceTick] = useState(0);
  const gesture = useRef({ mode: null, startDist: 0, startZoom: 1, startPan: { x: 0, y: 0 }, startTouch: { x: 0, y: 0 }, lastTap: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjsLib = await loadPdfJs();
        const doc = await pdfjsLib.getDocument({ data: base64ToUint8Array(base64) }).promise;
        if (cancelled) return;
        pdfRef.current = doc;
        setNumPages(doc.numPages);
        setStatus("ready");
      } catch (e) { if (!cancelled) setStatus("error"); }
    })();
    return () => { cancelled = true; };
  }, [base64]);

  useEffect(() => {
    if (status !== "ready" || !pdfRef.current) return;
    let cancelled = false;
    (async () => {
      setRendering(true);
      try {
        const pdfPage = await pdfRef.current.getPage(page);
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        const containerWidth = (viewportRef.current && viewportRef.current.clientWidth) || 320;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const baseViewport = pdfPage.getViewport({ scale: 1 });
        const scale = (containerWidth / baseViewport.width) * dpr;
        const viewport = pdfPage.getViewport({ scale });
        canvas.width = viewport.width; canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`; canvas.style.height = `${viewport.height / dpr}px`;
        const ctx = canvas.getContext("2d");
        await pdfPage.render({ canvasContext: ctx, viewport }).promise;
      } catch (e) { /* ignore a single failed page render */ }
      if (!cancelled) setRendering(false);
    })();
    return () => { cancelled = true; };
  }, [status, page]);

  // Reset zoom/pan whenever the page changes
  useEffect(() => { setZoom(1); pan.current = { x: 0, y: 0 }; forceTick((x) => x + 1); }, [page]);

  const dist = (t0, t1) => Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
  const clampZoom = (z) => Math.max(1, Math.min(4, z));

  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      gesture.current.mode = "pinch";
      gesture.current.startDist = dist(e.touches[0], e.touches[1]);
      gesture.current.startZoom = zoom;
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - gesture.current.lastTap < 280) { // double-tap → toggle zoom
        setZoom((z) => (z > 1 ? 1 : 2.5));
        pan.current = { x: 0, y: 0 }; forceTick((x) => x + 1);
        gesture.current.lastTap = 0;
        return;
      }
      gesture.current.lastTap = now;
      gesture.current.mode = "pan";
      gesture.current.startPan = { ...pan.current };
      gesture.current.startTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };
  const onTouchMove = (e) => {
    if (gesture.current.mode === "pinch" && e.touches.length === 2) {
      e.preventDefault();
      const d = dist(e.touches[0], e.touches[1]);
      setZoom(clampZoom(gesture.current.startZoom * (d / gesture.current.startDist)));
    } else if (gesture.current.mode === "pan" && e.touches.length === 1 && zoom > 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - gesture.current.startTouch.x;
      const dy = e.touches[0].clientY - gesture.current.startTouch.y;
      pan.current = { x: gesture.current.startPan.x + dx, y: gesture.current.startPan.y + dy };
      forceTick((x) => x + 1);
    }
  };
  const onTouchEnd = () => { gesture.current.mode = null; };
  const resetZoom = () => { setZoom(1); pan.current = { x: 0, y: 0 }; forceTick((x) => x + 1); };

  return createPortal(
    <div className="pdf-viewer anim-fadeIn">
      <div className="pdf-viewer-header liquid-glass">
        <button className="icon-btn" onClick={onClose}><ChevronLeft size={18} /></button>
        <div className="col g-1" style={{ flex: 1, minWidth: 0, alignItems: "center" }}>
          <span className="t-sm bold truncate" style={{ maxWidth: "70vw" }}>{title}</span>
          {status === "ready" && <span className="t-xs t-faint">Page {page} of {numPages}</span>}
        </div>
        <button className="icon-btn" onClick={resetZoom} disabled={zoom === 1}><RotateCcw size={16} /></button>
      </div>

      {status === "loading" && <div className="col center g-2" style={{ flex: 1, justifyContent: "center" }}><Loader2 size={26} className="anim-spin" /><span className="t-sm t-sub">Opening PDF…</span></div>}
      {status === "error" && <div className="col center g-2" style={{ flex: 1, justifyContent: "center" }}><span className="t-sm t-sub">Couldn't render this PDF.</span></div>}
      {status === "ready" && (
        <>
          <div
            ref={viewportRef}
            className="pdf-viewer-canvas-wrap"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div style={{ transform: `translate(${pan.current.x}px, ${pan.current.y}px) scale(${zoom})`, transformOrigin: "center center", transition: gesture.current.mode ? "none" : "transform 150ms ease" }}>
              <canvas ref={canvasRef} />
            </div>
            {rendering && <div className="pdf-viewer-loading"><Loader2 size={22} className="anim-spin" style={{ color: "#fff" }} /></div>}
          </div>
          <div className="pdf-viewer-footer liquid-glass">
            <Btn variant="ghost" glass className="btn-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft size={14} /> Prev</Btn>
            <div className="row g-2">
              <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => setZoom((z) => clampZoom(z - 0.5))}><Minus size={14} /></button>
              <span className="t-xs t-sub" style={{ minWidth: 34, textAlign: "center", alignSelf: "center" }}>{Math.round(zoom * 100)}%</span>
              <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => setZoom((z) => clampZoom(z + 0.5))}><Plus size={14} /></button>
            </div>
            <Btn variant="ghost" glass className="btn-sm" disabled={page >= numPages} onClick={() => setPage((p) => Math.min(numPages, p + 1))}>Next <ChevronRight size={14} /></Btn>
          </div>
        </>
      )}
    </div>,
    document.body
  );
}

function Study({ state, api, push, timer, setTimer, onNav }) {
  const key = todayKey();
  const [, forceTick] = useState(0);
  const [subjectDraft, setSubjectDraft] = useState("");
  const [showGoal, setShowGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(state.study.dailyGoalMinutes);

  // Long-press-to-edit + drag-to-reorder for the Subjects list, iOS-homescreen style:
  // a normal tap opens the subject; holding it for ~500ms (without much finger movement)
  // enters "edit mode" showing a minus badge on every row; a grip handle then lets you
  // drag any row up/down to reorder, reusing the same array-splice pattern as habit reorder.
  const [subjectEditMode, setSubjectEditMode] = useState(false);
  const [subjectDragId, setSubjectDragId] = useState(null);
  const [subjectDragY, setSubjectDragY] = useState(0);
  const subjectPressTimer = useRef(null);
  const subjectPressStart = useRef({ x: 0, y: 0 });
  const subjectDragStartY = useRef(0);
  const subjectDragStartIndex = useRef(0);
  const subjectRowHeight = useRef(64);

  const beginSubjectPress = (e, s) => {
    if (subjectEditMode) return; // in edit mode, only the grip handle starts a drag
    subjectPressStart.current = { x: e.clientX, y: e.clientY };
    subjectPressTimer.current = setTimeout(() => { setSubjectEditMode(true); hapticWarn(); }, 500);
  };
  const movePressCancel = (e) => {
    if (subjectPressTimer.current && (Math.abs(e.clientY - subjectPressStart.current.y) > 10 || Math.abs(e.clientX - subjectPressStart.current.x) > 10)) {
      clearTimeout(subjectPressTimer.current);
      subjectPressTimer.current = null;
    }
  };
  const endSubjectPress = (s, cancelled) => {
    if (subjectPressTimer.current) {
      clearTimeout(subjectPressTimer.current);
      subjectPressTimer.current = null;
      if (!subjectEditMode && !cancelled) onNav && onNav("subjectDetail", { param: s.id });
    }
  };
  const startSubjectDrag = (e, id, index) => {
    e.stopPropagation();
    e.preventDefault();
    const rowEl = e.currentTarget.closest(".subject-row");
    if (rowEl) subjectRowHeight.current = rowEl.getBoundingClientRect().height + 8;
    subjectDragStartY.current = e.clientY;
    subjectDragStartIndex.current = index;
    setSubjectDragY(0);
    setSubjectDragId(id);
    hapticTap();
  };
  useEffect(() => {
    if (!subjectDragId) return;
    const onMove = (e) => {
      const delta = e.clientY - subjectDragStartY.current;
      setSubjectDragY(delta);
      const newIndex = Math.max(0, Math.min(state.study.subjects.length - 1, subjectDragStartIndex.current + Math.round(delta / subjectRowHeight.current)));
      if (newIndex !== subjectDragStartIndex.current) {
        const arr = [...state.study.subjects];
        const [moved] = arr.splice(subjectDragStartIndex.current, 1);
        arr.splice(newIndex, 0, moved);
        api.reorderSubjects(arr);
        subjectDragStartIndex.current = newIndex;
        subjectDragStartY.current = e.clientY;
        setSubjectDragY(0);
        hapticTap();
      }
    };
    const onUp = () => { setSubjectDragId(null); setSubjectDragY(0); };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [subjectDragId, state.study.subjects]);

  useEffect(() => {
    if (!timer.running) return;
    const iv = setInterval(() => forceTick((x) => x + 1), 1000);
    const onVisible = () => { if (document.visibilityState === "visible") forceTick((x) => x + 1); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", onVisible); };
  }, [timer.running]);
  useEffect(() => { if (!timer.subjectId && state.study.subjects[0]) setTimer((tm) => ({ ...tm, subjectId: state.study.subjects[0].id })); }, [state.study.subjects]);

  const running = timer.running;
  const seconds = running ? timer.accumulated + Math.floor((Date.now() - timer.startedAt) / 1000) : timer.accumulated;
  const activeSubject = timer.subjectId || "";
  const setActiveSubject = (id) => setTimer((tm) => ({ ...tm, subjectId: id }));
  const start = () => setTimer((tm) => ({ ...tm, running: true, startedAt: Date.now() }));
  const pauseTimer = () => setTimer((tm) => ({ ...tm, running: false, accumulated: tm.accumulated + Math.floor((Date.now() - tm.startedAt) / 1000), startedAt: null }));
  const takeBreak = () => { if (running) pauseTimer(); api.logStudyBreak(); push("Break started — tap Resume when you're back", "default"); };

  const todayMin = state.study.sessions.filter((s) => s.date === key).reduce((a, s) => a + s.minutes, 0);
  const pct = Math.min(100, Math.round((todayMin / Math.max(1, state.study.dailyGoalMinutes)) * 100));
  const focusLabel = pct >= 90 ? "Excellent" : pct >= 60 ? "Good" : pct >= 30 ? "Fair" : "Getting Started";
  const todaySessions = state.study.sessions.filter((s) => s.date === key);
  const breaksToday = (state.study.breaks || []).filter((b) => b.date === key).length;

  const stopAndLog = () => {
    const finalSeconds = running ? timer.accumulated + Math.floor((Date.now() - timer.startedAt) / 1000) : timer.accumulated;
    if (finalSeconds < 30) { setTimer({ running: false, startedAt: null, accumulated: 0, subjectId: timer.subjectId }); return; }
    const minutes = Math.round(finalSeconds / 60);
    api.logStudySession({ subjectId: activeSubject || null, minutes, note: "", date: key });
    push(`Logged ${minutes} min of study`, "success");
    hapticTap();
    setTimer({ running: false, startedAt: null, accumulated: 0, subjectId: timer.subjectId });
  };
  const subjectName = (id) => state.study.subjects.find((s) => s.id === id)?.name || "General";
  const addSubject = () => { if (!subjectDraft.trim()) return; api.addSubject(subjectDraft.trim()); setSubjectDraft(""); push("Subject added", "success"); };

  return (
    <div className="anim-fadeUp">
      <div style={{ marginBottom: 16 }}><h1 className="greeting-title" style={{ fontSize: 24 }}>Study</h1><div className="t-sm t-sub">Focus. Learn. Achieve.</div></div>

      <Card strong className="col g-3" style={{ marginBottom: 16 }}>
        <div className="row-between">
          <div className="t-xs t-sub" style={{ textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 800 }}>Current Session</div>
          <Select value={activeSubject} onChange={(e) => setActiveSubject(e.target.value)} style={{ maxWidth: 160 }}>
            <option value="">General</option>{state.study.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </div>
        <div className="col center g-2" style={{ alignItems: "center", padding: "6px 0" }}>
          <div style={{ fontSize: 40, fontWeight: 800, fontFamily: "'Newsreader',serif" }}>{fmtTimer(seconds)}</div>
          <div className="t-xs t-sub">{running ? "Stay focused, keep going!" : "Ready when you are."}</div>
        </div>
        <div className="row g-2">
          {!running ? <Btn className="flex-1" onClick={start}><TimerIcon size={16} /> {seconds > 0 ? "Resume" : "Start"}</Btn> : <Btn variant="ghost" glass className="flex-1" onClick={pauseTimer}><Pause size={16} /> Pause</Btn>}
          <Btn variant="ghost" glass className="flex-1" onClick={takeBreak}><Clock size={16} /> Take a Break</Btn>
        </div>
        <Btn variant="ghost" glass block onClick={stopAndLog} disabled={seconds < 30}><Check size={16} /> Stop & Log</Btn>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div className="row-between">
          <div className="section-label" style={{ margin: 0 }}>Study Goal</div>
          <button className="t-xs bold" style={{ color: "var(--accent)", background: "none", border: "none" }} onClick={() => { setGoalDraft(state.study.dailyGoalMinutes); setShowGoal(true); }}>Change Goal</button>
        </div>
        <div className="row-between" style={{ marginTop: 6 }}>
          <div><div style={{ fontSize: 22, fontWeight: 800 }}>{fmtHM(state.study.dailyGoalMinutes)}</div><div className="t-xs t-sub">Today's Goal</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>{fmtHM(todayMin)}</div><div className="t-xs t-sub">Completed</div></div>
        </div>
        <div style={{ marginTop: 10 }}><ProgressBar value={pct} /></div>
        <div className="t-xs t-faint" style={{ marginTop: 6 }}>{pct}% of today's goal</div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div className="section-label">Today Overview</div>
        <div className="grid grid-4" style={{ gap: 8, marginTop: 6 }}>
          <div className="col g-1" style={{ alignItems: "center" }}><CheckSquare size={15} className="t-faint" /><span className="bold t-sm">{todaySessions.length}</span><span className="t-xs t-faint" style={{ textAlign: "center" }}>Sessions</span></div>
          <div className="col g-1" style={{ alignItems: "center" }}><TimerIcon size={15} className="t-faint" /><span className="bold t-sm">{fmtHM(todayMin)}</span><span className="t-xs t-faint" style={{ textAlign: "center" }}>Study Time</span></div>
          <div className="col g-1" style={{ alignItems: "center" }}><Target size={15} className="t-faint" /><span className="bold t-sm">{focusLabel}</span><span className="t-xs t-faint" style={{ textAlign: "center" }}>Focus {pct}%</span></div>
          <div className="col g-1" style={{ alignItems: "center" }}><Pause size={15} className="t-faint" /><span className="bold t-sm">{breaksToday}</span><span className="t-xs t-faint" style={{ textAlign: "center" }}>Breaks</span></div>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div className="row-between" style={{ marginBottom: 10 }}>
          <div className="section-label" style={{ margin: 0 }}>Subjects</div>
          {subjectEditMode && <button className="t-xs bold" style={{ color: "var(--accent)", background: "none", border: "none" }} onClick={() => setSubjectEditMode(false)}>Done</button>}
        </div>
        {subjectEditMode && <div className="t-xs t-faint" style={{ marginBottom: 10, marginTop: -4 }}>Drag the handle to reorder · tap the minus to delete</div>}
        <div className="col g-2" style={{ marginBottom: 12 }}>
          {state.study.subjects.map((s, i) => {
            const meta = subjectMeta(s.name, i);
            const Icon = meta.icon;
            const tMin = subjectTodayMinutes(s, state.study.sessions);
            const prog = subjectOverallProgress(s);
            const dragging = subjectDragId === s.id;
            return (
              <div
                key={s.id}
                className={`prayer-row subject-row ${subjectEditMode ? "subject-row-editing" : ""} ${dragging ? "subject-row-dragging" : ""}`}
                style={{ height: "auto", transform: dragging ? `translateY(${subjectDragY}px) scale(1.03)` : undefined, zIndex: dragging ? 5 : 1 }}
                onPointerDown={(e) => beginSubjectPress(e, s)}
                onPointerMove={movePressCancel}
                onPointerUp={() => endSubjectPress(s)}
                onPointerCancel={() => endSubjectPress(s, true)}
              >
                {subjectEditMode && (
                  <button
                    className="subject-delete-badge"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!confirm(`Delete "${s.name}"? This removes its chapters, notes, and resources — logged study time stays in your stats.`)) return;
                      api.removeSubject(s.id);
                      push("Subject deleted", "success");
                    }}
                  ><Minus size={12} strokeWidth={3} /></button>
                )}
                <span className="prayer-row-icon" style={{ background: `color-mix(in srgb, ${meta.color} 22%, transparent)`, color: meta.color }}><Icon size={16} /></span>
                <span className="col g-1" style={{ flex: 1, minWidth: 0, alignItems: "flex-start" }}>
                  <span className="bold t-sm">{s.name}</span>
                  <span className="t-xs t-sub">Today: {fmtHM(tMin)} · {prog}%</span>
                </span>
                {subjectEditMode
                  ? <span className="subject-drag-handle" onPointerDown={(e) => startSubjectDrag(e, s.id, i)}><GripVertical size={16} /></span>
                  : <ChevronRight size={16} className="t-faint" />}
              </div>
            );
          })}
        </div>
        <div className="row g-2">
          <Input placeholder="Add subject e.g. Physics" value={subjectDraft} onChange={(e) => setSubjectDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSubject()} />
          <Btn variant="ghost" icon onClick={addSubject}><Plus size={14} /></Btn>
        </div>
      </Card>

      <Card>
        <div className="section-label">Today's Sessions</div>
        {todaySessions.length === 0 ? <div className="t-sm t-sub">No sessions yet today.</div> : (
          <div className="col g-2">
            {todaySessions.map((s) => (
              <div key={s.id} className="row-between t-sm" style={{ background: "var(--divider)", borderRadius: 12, padding: "8px 10px" }}>
                <span>{subjectName(s.subjectId)}</span><span className="mono t-sub">{s.minutes}m</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showGoal && (
        <Modal title="Change Study Goal" onClose={() => setShowGoal(false)} footer={<Btn block onClick={() => { api.setStudyGoal(goalDraft); setShowGoal(false); push("Goal updated", "success"); }}><Check size={15} /> Save Goal</Btn>}>
          <Field label="Daily Goal (minutes)"><Input type="number" min="10" step="10" value={goalDraft} onChange={(e) => setGoalDraft(Number(e.target.value))} /></Field>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Sketch Pad ---------------- */
function SketchPad({ onSave, onClose }) {
  const canvasRef = useRef(null);
  const [color, setColor] = useState("#1a1a1a");
  const drawing = useRef(false);
  useEffect(() => {
    const c = canvasRef.current; const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
  }, []);
  const posFromEvent = (e) => {
    const c = canvasRef.current; const rect = c.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: (p.clientX - rect.left) * (c.width / rect.width), y: (p.clientY - rect.top) * (c.height / rect.height) };
  };
  const start = (e) => { e.preventDefault(); drawing.current = true; const ctx = canvasRef.current.getContext("2d"); const pos = posFromEvent(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); };
  const move = (e) => { if (!drawing.current) return; e.preventDefault(); const ctx = canvasRef.current.getContext("2d"); const pos = posFromEvent(e); ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineTo(pos.x, pos.y); ctx.stroke(); };
  const end = () => { drawing.current = false; };
  const clear = () => { const c = canvasRef.current; const ctx = c.getContext("2d"); ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, c.width, c.height); };
  const save = () => onSave(canvasRef.current.toDataURL("image/png"));
  return (
    <Modal title="Sketch Book" onClose={onClose} footer={<Btn block onClick={save}><Check size={15} /> Save Sketch</Btn>}>
      <canvas ref={canvasRef} width={320} height={320} style={{ width: "100%", borderRadius: 14, border: "1px solid var(--card-border)", touchAction: "none" }}
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
      <div className="row g-2" style={{ marginTop: 10, alignItems: "center" }}>
        {["#1a1a1a", "#c0392b", "#2166b8", "#2f9e5c"].map((c) => (
          <button key={c} onClick={() => setColor(c)} style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: color === c ? "2px solid var(--accent)" : "1px solid var(--card-border)" }} />
        ))}
        <button className="t-xs bold" style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--accent)" }} onClick={clear}>Clear</button>
      </div>
    </Modal>
  );
}

/* ---------------- Subject Detail ---------------- */
function SubjectDetailView({ state, api, push, onNav, subjectId }) {
  const subject = state.study.subjects.find((x) => x.id === subjectId);
  const [tab, setTab] = useState("chapters");
  const [chapterDraft, setChapterDraft] = useState("");
  const [openChapter, setOpenChapter] = useState(null);
  const [showSketch, setShowSketch] = useState(false);
  const [notesDraft, setNotesDraft] = useState(subject?.notes || "");
  const fileRef = useRef(null);
  const stopSwipe = { onTouchStart: (e) => e.stopPropagation(), onTouchMove: (e) => e.stopPropagation(), onTouchEnd: (e) => e.stopPropagation() };

  if (!subject) return (
    <div className="anim-fadeUp col center g-2" style={{ paddingTop: 40 }}>
      <div className="t-sm t-sub">Subject not found.</div>
      <Btn variant="ghost" glass onClick={() => onNav && onNav("study")}>Back to Study</Btn>
    </div>
  );

  const idx = state.study.subjects.findIndex((x) => x.id === subjectId);
  const meta = subjectMeta(subject.name, idx);
  const Icon = meta.icon;
  const chapters = subject.chapters || [];
  const overallProgress = subjectOverallProgress(subject);
  const completedCh = chapters.filter((c) => c.status === "completed").length;
  const sessions = state.study.sessions;
  const weekMinutes = subjectWeekMinutes(subject, sessions);
  const week = weekStartingSunday();
  const maxWeek = Math.max(1, ...weekMinutes);
  const totalMin = subjectTotalMinutes(subject, sessions);
  const streak = subjectStreak(subject, sessions);
  const totalSessions = sessions.filter((s) => s.subjectId === subject.id).length;

  const addChapter = () => { if (!chapterDraft.trim()) return; api.addChapter(subject.id, chapterDraft.trim()); setChapterDraft(""); };
  const setChapterStatus = (chapterId, status) => {
    const progress = status === "completed" ? 100 : status === "notStarted" ? 0 : 50;
    api.updateChapter(subject.id, chapterId, { status, progress });
  };
  const [uploading, setUploading] = useState(false);
  const onPickFile = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (!isNative() && file.size > 4 * 1024 * 1024) { push("Browser preview keeps PDFs under 4MB — full size works once installed on your phone", "danger"); e.target.value = ""; return; }
    setUploading(true);
    try {
      const resource = await saveResourceFile(subject.id, file);
      api.addSubjectResource(subject.id, resource);
      push(isNative() ? "Saved to device storage" : "Resource added", "success");
    } catch (err) { push("Couldn't save file", "danger"); }
    setUploading(false);
    e.target.value = "";
  };
  const [viewingResource, setViewingResource] = useState(null); // { title, base64 } | "loading"
  const openResource = async (r) => {
    setViewingResource({ title: r.title, base64: null, loading: true });
    try { const base64 = await getResourceBase64(r); setViewingResource({ title: r.title, base64 }); }
    catch (e) { setViewingResource(null); push("Couldn't open this file", "danger"); }
  };
  const removeResource = async (r) => { await deleteResourceFile(r); api.deleteSubjectResource(subject.id, r.id); };

  const TABS_ROW = [["chapters", "Chapters"], ["notes", "Notes"], ["resources", "Books (PDF)"], ["sketch", "Sketch Book"], ["stats", "Stats"]];

  return (
    <div className="anim-fadeUp col g-4">
      <div className="row g-3" style={{ alignItems: "center" }}>
        <span className="hobby-detail-icon" style={{ width: 60, height: 60, background: `color-mix(in srgb, ${meta.color} 25%, transparent)`, color: meta.color }}><Icon size={26} /></span>
        <div className="col g-1" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 21, fontWeight: 800 }}>{subject.name}</div>
          <Badge tone={overallProgress >= 70 ? "success" : "default"}>{overallProgress}% Completed</Badge>
        </div>
      </div>

      <div className="quick-tools-row" {...stopSwipe}>
        {TABS_ROW.map(([k, label]) => (
          <button key={k} className={`chip-scroll ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {tab === "chapters" && (
        <>
          <Card>
            <div className="row-between"><div className="section-label" style={{ margin: 0 }}>Overall Progress</div><span className="t-xs bold" style={{ color: "var(--accent)" }}>{overallProgress}%</span></div>
            <div style={{ marginTop: 8 }}><ProgressBar value={overallProgress} /></div>
            <div className="t-xs t-faint" style={{ marginTop: 6 }}>{completedCh} of {chapters.length} Chapters Completed</div>
          </Card>
          <Card>
            <div className="row-between" style={{ marginBottom: 10 }}><div className="section-label" style={{ margin: 0 }}>Chapters</div><span className="t-xs t-sub">{completedCh}/{chapters.length}</span></div>
            {chapters.length === 0 ? <div className="t-xs t-sub">No chapters yet — add your syllabus below.</div> : (
              <div className="col g-2">
                {chapters.map((c) => (
                  <button key={c.id} className="prayer-row" style={{ height: "auto", alignItems: "flex-start" }} onClick={() => setOpenChapter(c.id === openChapter ? null : c.id)}>
                    <span className="col g-1" style={{ flex: 1, minWidth: 0, alignItems: "flex-start" }}>
                      <span className="row-between" style={{ width: "100%" }}><span className="bold t-sm">{c.title}</span><span className="t-xs bold">{c.progress}%</span></span>
                      <ProgressBar value={c.progress} thin />
                      <Badge tone={CHAPTER_STATUS[c.status].tone}>{CHAPTER_STATUS[c.status].label}</Badge>
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="row g-2" style={{ marginTop: 12 }}>
              <Input placeholder="Add chapter title" value={chapterDraft} onChange={(e) => setChapterDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addChapter()} />
              <Btn variant="ghost" icon onClick={addChapter}><Plus size={14} /></Btn>
            </div>
          </Card>
        </>
      )}

      {tab === "notes" && (
        <Card>
          <div className="section-label">Notes</div>
          <textarea className="input" style={{ minHeight: 220, resize: "vertical", width: "100%" }} value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} placeholder="Write your notes for this subject..." />
          <Btn style={{ marginTop: 10 }} onClick={() => { api.setSubjectNotes(subject.id, notesDraft); push("Notes saved", "success"); }}><Check size={15} /> Save Notes</Btn>
        </Card>
      )}

      {tab === "resources" && (
        <Card>
          <div className="row-between" style={{ marginBottom: 10 }}>
            <div className="section-label" style={{ margin: 0 }}>Books & PDFs</div>
            <button className="icon-btn" onClick={() => fileRef.current && fileRef.current.click()} disabled={uploading}>{uploading ? <Loader2 size={15} className="anim-spin" /> : <Plus size={15} />}</button>
            <input ref={fileRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={onPickFile} />
          </div>
          {(subject.resources || []).length === 0 ? <div className="t-xs t-sub">No PDFs saved yet. Tap + to add one from your device.</div> : (
            <div className="col g-2">
              {subject.resources.map((r) => (
                <div key={r.id} className="row-between" style={{ padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 14 }}>
                  <div className="row g-2" style={{ alignItems: "center", minWidth: 0 }}>
                    <span className="prayer-row-icon"><BookOpen size={15} /></span>
                    <div className="col g-1" style={{ minWidth: 0 }}><span className="t-sm bold truncate">{r.title}</span><span className="t-xs t-faint">{r.sizeLabel}{r.native ? " · on this device" : ""}</span></div>
                  </div>
                  <div className="row g-2">
                    <button className="icon-btn" style={{ width: 28, height: 28, border: "none", background: "transparent" }} onClick={() => openResource(r)}><ArrowRight size={14} /></button>
                    <button className="icon-btn" style={{ width: 28, height: 28, border: "none", background: "transparent" }} onClick={() => removeResource(r)}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="t-xs t-faint" style={{ marginTop: 10 }}>
            {isNative() ? "PDFs are saved on this device (not synced through Firestore), so any size works." : "Installed on your phone, PDFs save straight to device storage — no size limit. In this browser preview, files stay under 4MB."}
          </div>
        </Card>
      )}

      {tab === "sketch" && (
        <Card>
          <div className="row-between" style={{ marginBottom: 10 }}>
            <div className="section-label" style={{ margin: 0 }}>Sketch Book</div>
            <Btn variant="ghost" glass className="btn-sm" onClick={() => setShowSketch(true)}><Feather size={14} /> New Sketch</Btn>
          </div>
          {(subject.sketches || []).length === 0 ? <div className="t-xs t-sub">No sketches yet — draw diagrams or rough work.</div> : (
            <div className="grid grid-3" style={{ gap: 8 }}>
              {subject.sketches.map((sk) => (
                <div key={sk.id} className="col g-1" style={{ position: "relative" }}>
                  <img src={sk.dataUrl} style={{ width: "100%", borderRadius: 10, border: "1px solid var(--card-border)" }} />
                  <button className="icon-btn" style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, border: "none" }} onClick={() => api.deleteSketch(subject.id, sk.id)}><X size={11} /></button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "stats" && (
        <>
          <div className="grid grid-2" style={{ gap: 10 }}>
            <Card className="col center g-1" style={{ padding: 14 }}><Flame size={16} style={{ color: "#e08a3e" }} /><span className="bold t-lg">{streak}</span><span className="t-xs t-sub">Day Streak</span></Card>
            <Card className="col center g-1" style={{ padding: 14 }}><Clock size={16} className="t-sub" /><span className="bold t-lg">{fmtHM(totalMin)}</span><span className="t-xs t-sub">Total Time</span></Card>
            <Card className="col center g-1" style={{ padding: 14 }}><CheckSquare size={16} className="t-sub" /><span className="bold t-lg">{totalSessions}</span><span className="t-xs t-sub">Sessions</span></Card>
            <Card className="col center g-1" style={{ padding: 14 }}><Target size={16} className="t-sub" /><span className="bold t-lg">{overallProgress}%</span><span className="t-xs t-sub">Progress</span></Card>
          </div>
          <Card>
            <div className="section-label">This Week</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 70, marginTop: 8 }}>
              {week.map((k, i) => (
                <div key={k} className="col g-2" style={{ flex: 1, alignItems: "center" }}>
                  <div className="week-bar-track"><div className="week-bar-fill" style={{ height: `${(weekMinutes[i] / maxWeek) * 100}%`, background: `linear-gradient(180deg, ${meta.color}, var(--accent-2))` }} /></div>
                  <span className="t-xs t-faint">{dayLabel1(k)}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {openChapter && (() => {
        const c = chapters.find((x) => x.id === openChapter); if (!c) return null;
        return (
          <Modal title={c.title} onClose={() => setOpenChapter(null)}>
            <div className="row g-2" style={{ flexWrap: "wrap", marginBottom: 12 }}>
              {Object.keys(CHAPTER_STATUS).map((st) => <Chip key={st} active={c.status === st} onClick={() => setChapterStatus(c.id, st)}>{CHAPTER_STATUS[st].label}</Chip>)}
            </div>
            <Field label="Progress %"><Input type="number" min="0" max="100" value={c.progress} onChange={(e) => api.updateChapter(subject.id, c.id, { progress: Math.max(0, Math.min(100, Number(e.target.value))) })} /></Field>
            <Field label="Chapter Notes"><textarea className="input" style={{ minHeight: 100, width: "100%" }} value={c.notes || ""} onChange={(e) => api.updateChapter(subject.id, c.id, { notes: e.target.value })} placeholder="Notes for this chapter..." /></Field>
            <Btn variant="danger" glass block onClick={() => { api.deleteChapter(subject.id, c.id); setOpenChapter(null); }}><Trash2 size={14} /> Delete Chapter</Btn>
          </Modal>
        );
      })()}

      {showSketch && <SketchPad onClose={() => setShowSketch(false)} onSave={(dataUrl) => { api.addSketch(subject.id, { dataUrl }); setShowSketch(false); push("Sketch saved", "success"); }} />}
      {viewingResource && viewingResource.loading && (
        <Modal title={viewingResource.title} onClose={() => setViewingResource(null)}>
          <div className="col center g-2" style={{ padding: "40px 0" }}><Loader2 size={24} className="anim-spin" /><span className="t-sm t-sub">Opening PDF…</span></div>
        </Modal>
      )}
      {viewingResource && !viewingResource.loading && (
        <PdfViewerModal title={viewingResource.title} base64={viewingResource.base64} onClose={() => setViewingResource(null)} />
      )}
    </div>
  );
}

/* ============================================================
   POMODORO
   ============================================================ */
function Pomodoro({ state, api }) {
  const key = todayKey();
  const pomo = state.pomodoro;
  const [mode, setMode] = useState("focus");
  const [round, setRound] = useState(1);
  const totalSec = (mode === "focus" ? pomo.focusMin : mode === "longBreak" ? pomo.longBreakMin : pomo.breakMin) * 60;
  const [secsLeft, setSecsLeft] = useState(totalSec);
  const [running, setRunning] = useState(false);

  useEffect(() => { setSecsLeft(totalSec); }, [mode, pomo.focusMin, pomo.breakMin, pomo.longBreakMin]);
  useEffect(() => {
    if (!running) return;
    if (secsLeft <= 0) {
      const minutes = mode === "focus" ? pomo.focusMin : mode === "longBreak" ? pomo.longBreakMin : pomo.breakMin;
      api.logPomodoro(mode === "focus" ? "focus" : "break", minutes);
      hapticSuccess();
      notifyLocal("HayatOS", mode === "focus" ? "Focus session complete — take a break!" : "Break's over — back to focus.");
      if (mode === "focus") setMode(round % pomo.roundsBeforeLong === 0 ? "longBreak" : "break");
      else { setMode("focus"); setRound((r) => r + 1); }
      setRunning(false);
      return;
    }
    const iv = setInterval(() => setSecsLeft((s) => s - 1), 1000);
    return () => clearInterval(iv);
  }, [running, secsLeft, mode]);

  const pct = ((totalSec - secsLeft) / totalSec) * 100;
  const focusToday = pomo.log.filter((l) => l.date === key && l.type === "focus").reduce((a, l) => a + l.minutes, 0);
  const sessionsToday = pomo.log.filter((l) => l.date === key && l.type === "focus").length;
  const modeLabel = { focus: "Focus", break: "Short Break", longBreak: "Long Break" }[mode];
  const reset = () => { setRunning(false); setSecsLeft(totalSec); };

  return (
    <div className="anim-fadeUp">
      <div style={{ marginBottom: 18 }}><h1 className="greeting-title" style={{ fontSize: 24 }}>Focus Timer</h1><div className="t-sm t-sub">{fmtHM(focusToday)} focused today · {sessionsToday} sessions</div></div>
      <Card strong className="col center g-3" style={{ alignItems: "center", padding: "30px 20px", marginBottom: 16 }}>
        <Badge tone={mode === "focus" ? "success" : "default"}>{modeLabel} · Round {round}</Badge>
        <ProgressRing value={pct} size={190} stroke={15} glow={running} label={fmtTimer(secsLeft)} />
        <div className="row g-2">
          {!running ? <Btn onClick={() => setRunning(true)}><TimerIcon size={16} /> {secsLeft === totalSec ? "Start" : "Resume"}</Btn> : <Btn variant="ghost" onClick={() => setRunning(false)}><Pause size={16} /> Pause</Btn>}
          <Btn variant="ghost" onClick={reset}><RotateCcw size={16} /> Reset</Btn>
        </div>
      </Card>
      <Card>
        <div className="section-label">Durations (minutes)</div>
        <div className="grid grid-3">
          <div><div className="t-xs t-sub" style={{ marginBottom: 6 }}>Focus</div><Input type="number" min="5" max="120" value={pomo.focusMin} onChange={(e) => api.setPomodoroSettings({ focusMin: Number(e.target.value) })} /></div>
          <div><div className="t-xs t-sub" style={{ marginBottom: 6 }}>Short Break</div><Input type="number" min="1" max="60" value={pomo.breakMin} onChange={(e) => api.setPomodoroSettings({ breakMin: Number(e.target.value) })} /></div>
          <div><div className="t-xs t-sub" style={{ marginBottom: 6 }}>Long Break</div><Input type="number" min="5" max="60" value={pomo.longBreakMin} onChange={(e) => api.setPomodoroSettings({ longBreakMin: Number(e.target.value) })} /></div>
        </div>
        <div style={{ height: 1, background: "var(--divider)", margin: "16px 0" }} />
        <div className="section-label">Today's Sessions</div>
        <div className="row wrap g-2">
          {pomo.log.filter((l) => l.date === key).length === 0 ? <span className="t-sm t-sub">No sessions yet — hit start!</span> :
            pomo.log.filter((l) => l.date === key).map((l) => <Badge key={l.id} tone={l.type === "focus" ? "success" : "default"}>{l.type === "focus" ? "🎯" : "☕"} {l.minutes}m</Badge>)}
        </div>
      </Card>
    </div>
  );
}
/* ============================================================
   WATER
   ============================================================ */
function Water({ state, api, push }) {
  const key = todayKey();
  const count = state.water.days[key] || 0;
  const goal = state.water.goalGlasses;
  const pct = Math.min(100, Math.round((count / Math.max(1, goal)) * 100));
  const week = lastNDays(7);
  const [goalDraft, setGoalDraft] = useState(goal);
  return (
    <div className="anim-fadeUp">
      <div style={{ marginBottom: 18 }}><h1 className="greeting-title" style={{ fontSize: 24 }}>Water Tracker</h1><div className="t-sm t-sub">{count}/{goal} glasses · {count * state.water.glassMl}ml today</div></div>
      <Card strong className="col center g-3" style={{ alignItems: "center", padding: "26px 20px", marginBottom: 16 }}>
        <ProgressRing value={pct} label={`${count}/${goal}`} glow={count >= goal} />
        <div className="row g-2">
          <Btn variant="ghost" icon onClick={() => api.addWater(key, -1)} disabled={count <= 0}><Minus size={16} /></Btn>
          <Btn onClick={() => { api.addWater(key, 1); hapticTap(); if (count + 1 === goal) push("Hydration goal reached! 💧", "success"); }}><Droplet size={16} /> Add Glass</Btn>
          <Btn variant="ghost" icon onClick={() => api.addWater(key, 1)}><Plus size={16} /></Btn>
        </div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div className="section-label">Today's Glasses</div>
        <div className="row wrap g-2">
          {Array.from({ length: Math.max(goal, count) }).map((_, i) => <Droplet key={i} size={24} color={i < count ? "var(--accent)" : "var(--text-3)"} fill={i < count ? "var(--accent)" : "none"} />)}
        </div>
      </Card>
      <Card>
        <div className="row-between">
          <div className="section-label" style={{ margin: 0 }}>Daily Goal</div>
          <div className="row g-2"><Input type="number" min="1" max="20" value={goalDraft} onChange={(e) => setGoalDraft(Number(e.target.value))} style={{ width: 64 }} /><Btn variant="ghost" onClick={() => { api.setWaterGoal(goalDraft); push("Goal updated"); }}>Set</Btn></div>
        </div>
        <div className="section-label" style={{ marginTop: 14 }}>This Week</div>
        <div className="row" style={{ alignItems: "flex-end", gap: 8, height: 90 }}>
          {week.map((k) => {
            const c = state.water.days[k] || 0;
            return (
              <div key={k} className="col center g-1" style={{ flex: 1, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ width: "100%", maxWidth: 20, borderRadius: 8, height: `${Math.max(4, (c / Math.max(goal, 1)) * 100)}%`, background: "var(--progress-grad)" }} />
                <span className="t-xs t-faint">{dayLabel1(k)}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   SLEEP
   ============================================================ */
function Sleep({ state, api, push }) {
  const key = todayKey();
  const [sleepTime, setSleepTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [goalDraft, setGoalDraft] = useState(state.sleep.goalHours);
  const todayLog = state.sleep.logs.find((l) => l.date === key);
  const week = lastNDays(7);
  const weekLogs = week.map((k) => state.sleep.logs.find((l) => l.date === k));
  const avgMin = weekLogs.filter(Boolean).length ? weekLogs.filter(Boolean).reduce((a, l) => a + l.durationMin, 0) / weekLogs.filter(Boolean).length : 0;
  const pct = todayLog ? Math.min(100, Math.round((todayLog.durationMin / 60 / state.sleep.goalHours) * 100)) : 0;
  const submit = () => { api.logSleep({ date: key, sleepTime, wakeTime, note: "" }); push("Sleep logged", "success"); hapticTap(); };
  return (
    <div className="anim-fadeUp">
      <div style={{ marginBottom: 18 }}><h1 className="greeting-title" style={{ fontSize: 24 }}>Sleep Tracker</h1><div className="t-sm t-sub">7-day avg {fmtHM(avgMin)} · goal {state.sleep.goalHours}h</div></div>
      <Card strong className="col center g-3" style={{ alignItems: "center", padding: "26px 20px", marginBottom: 16 }}>
        <ProgressRing value={pct} label={todayLog ? fmtHM(todayLog.durationMin) : "—"} glow={pct >= 100} />
        <div className="row g-2"><span className="t-xs t-sub">Goal</span><Input type="number" min="4" max="12" value={goalDraft} onChange={(e) => setGoalDraft(Number(e.target.value))} style={{ width: 64 }} /><Btn variant="ghost" onClick={() => { api.setSleepGoal(goalDraft); push("Goal updated"); }}>Set</Btn></div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div className="section-label">Log Last Night</div>
        <div className="grid grid-2" style={{ marginBottom: 12 }}>
          <Field label="Slept at"><TimeField value={sleepTime} onChange={setSleepTime} /></Field>
          <Field label="Woke at"><TimeField value={wakeTime} onChange={setWakeTime} /></Field>
        </div>
        <Btn block onClick={submit}><Moon size={16} /> Log Sleep</Btn>
      </Card>
      <Card>
        <div className="section-label">This Week</div>
        <div className="row" style={{ alignItems: "flex-end", gap: 8, height: 90 }}>
          {week.map((k, i) => {
            const l = weekLogs[i]; const h = l ? l.durationMin / 60 : 0;
            return (
              <div key={k} className="col center g-1" style={{ flex: 1, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ width: "100%", maxWidth: 20, borderRadius: 8, height: `${Math.max(4, (h / 10) * 100)}%`, background: "var(--progress-grad)" }} />
                <span className="t-xs t-faint">{dayLabel1(k)}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   MONEY
   ============================================================ */
function Money({ state, api, push }) {
  const cur = state.money.currency;
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [noteVal, setNoteVal] = useState("");
  const [savingsDraft, setSavingsDraft] = useState(state.money.savingsGoal.target);
  const income = state.money.transactions.filter((x) => x.type === "income").reduce((a, x) => a + x.amount, 0);
  const expense = state.money.transactions.filter((x) => x.type === "expense").reduce((a, x) => a + x.amount, 0);
  const balance = income - expense;
  const byCategory = {};
  state.money.transactions.filter((x) => x.type === "expense").forEach((x) => { byCategory[x.category] = (byCategory[x.category] || 0) + x.amount; });
  const catList = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(1, ...catList.map((c) => c[1]));
  const submit = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { push("Enter a valid amount", "danger"); return; }
    api.addTransaction({ type, amount: amt, category, note: noteVal });
    setAmount(""); setNoteVal(""); push("Transaction added", "success"); hapticTap();
  };
  return (
    <div className="anim-fadeUp">
      <div style={{ marginBottom: 18 }}><h1 className="greeting-title" style={{ fontSize: 24 }}>Money Tracker</h1><div className="t-sm t-sub">Balance {cur}{balance.toLocaleString()}</div></div>
      <div className="grid grid-3" style={{ marginBottom: 16 }}>
        <Card><div className="section-label" style={{ margin: 0 }}>Income</div><div className="t-lg xbold" style={{ color: "var(--success)", marginTop: 4 }}>{cur}{income.toLocaleString()}</div></Card>
        <Card><div className="section-label" style={{ margin: 0 }}>Expense</div><div className="t-lg xbold" style={{ color: "var(--danger)", marginTop: 4 }}>{cur}{expense.toLocaleString()}</div></Card>
        <Card><div className="section-label" style={{ margin: 0 }}>Balance</div><div className="t-lg xbold" style={{ color: "var(--accent)", marginTop: 4 }}>{cur}{balance.toLocaleString()}</div></Card>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div className="section-label">Add Transaction</div>
        <div className="row g-2" style={{ marginBottom: 12 }}>
          <Chip active={type === "expense"} onClick={() => setType("expense")}>Expense</Chip>
          <Chip active={type === "income"} onClick={() => setType("income")}>Income</Chip>
        </div>
        <div className="col g-2">
          <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Input placeholder="Note (optional)" value={noteVal} onChange={(e) => setNoteVal(e.target.value)} />
          <Btn onClick={submit}><Plus size={16} /> Add</Btn>
        </div>
        <div style={{ height: 1, background: "var(--divider)", margin: "16px 0" }} />
        <div className="section-label">Savings Goal</div>
        <div className="row g-2" style={{ marginBottom: 10 }}><Input type="number" value={savingsDraft} onChange={(e) => setSavingsDraft(Number(e.target.value))} /><Btn variant="ghost" onClick={() => api.setSavingsGoal(savingsDraft, state.money.savingsGoal.current)}>Set</Btn></div>
        <ProgressBar value={state.money.savingsGoal.target ? (state.money.savingsGoal.current / state.money.savingsGoal.target) * 100 : 0} />
        <div className="t-xs t-faint" style={{ marginTop: 6 }}>{cur}{state.money.savingsGoal.current} of {cur}{state.money.savingsGoal.target}</div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div className="section-label">Spending by Category</div>
        {catList.length === 0 ? <div className="t-sm t-sub">No expenses logged yet.</div> : (
          <div className="col g-3">
            {catList.map(([c, amt]) => (
              <div key={c}>
                <div className="row-between t-sm" style={{ marginBottom: 4 }}><span>{c}</span><span className="t-sub">{cur}{amt.toLocaleString()}</span></div>
                <div style={{ height: 8, borderRadius: 999, background: "var(--divider)", overflow: "hidden" }}><div style={{ height: "100%", width: `${(amt / maxCat) * 100}%`, background: "var(--progress-grad)" }} /></div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <div className="section-label">Recent Transactions</div>
        {state.money.transactions.length === 0 ? <div className="t-sm t-sub">Nothing yet.</div> : (
          <div className="col g-2" style={{ maxHeight: 220, overflowY: "auto" }}>
            {state.money.transactions.slice(0, 12).map((x) => (
              <div key={x.id} className="row-between t-sm" style={{ background: "var(--divider)", borderRadius: 12, padding: "8px 10px" }}>
                <div><span className="bold">{x.category}</span>{x.note && <span className="t-faint"> · {x.note}</span>}</div>
                <div className="row g-2">
                  <span className="mono" style={{ color: x.type === "income" ? "var(--success)" : "var(--danger)" }}>{x.type === "income" ? "+" : "-"}{cur}{x.amount}</span>
                  <button onClick={() => api.deleteTransaction(x.id)} className="t-faint" style={{ background: "none", border: "none" }}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ============================================================
   TRADING
   ============================================================ */
function Trading({ state, api, push }) {
  const [lessonDraft, setLessonDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [pattern, setPattern] = useState("");
  const [outcome, setOutcome] = useState("be");
  const [sessionNote, setSessionNote] = useState("");
  const wins = state.trading.sessions.filter((s) => s.outcome === "win").length;
  const total = state.trading.sessions.length;
  const winRate = total ? Math.round((wins / total) * 100) : 0;
  return (
    <div className="anim-fadeUp">
      <div style={{ marginBottom: 18 }}><h1 className="greeting-title" style={{ fontSize: 24 }}>Trading Tracker</h1><div className="t-sm t-sub">{total} sessions · {winRate}% win rate</div></div>
      <Card style={{ marginBottom: 16 }}>
        <div className="section-label">Lessons Checklist</div>
        <div className="col g-2" style={{ marginBottom: 10, maxHeight: 200, overflowY: "auto" }}>
          {state.trading.lessons.map((l) => (
            <div key={l.id} className="row g-2">
              <input type="checkbox" checked={l.done} onChange={() => api.toggleTradingLesson(l.id)} style={{ width: 16, height: 16 }} />
              <span className="flex-1 t-sm" style={{ textDecoration: l.done ? "line-through" : "none", color: l.done ? "var(--text-3)" : "var(--text-1)" }}>{l.title}</span>
              <button onClick={() => api.deleteTradingLesson(l.id)} className="t-faint" style={{ background: "none", border: "none" }}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
        <div className="row g-2">
          <Input placeholder="Add lesson / book / pattern..." value={lessonDraft} onChange={(e) => setLessonDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lessonDraft.trim() && (api.addTradingLesson(lessonDraft.trim()), setLessonDraft(""))} />
          <Btn variant="ghost" icon onClick={() => { if (lessonDraft.trim()) { api.addTradingLesson(lessonDraft.trim()); setLessonDraft(""); } }}><Plus size={14} /></Btn>
        </div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div className="section-label">Log Practice Session</div>
        <div className="grid grid-2" style={{ marginBottom: 12 }}>
          <Input placeholder="Chart pattern" value={pattern} onChange={(e) => setPattern(e.target.value)} />
          <Select value={outcome} onChange={(e) => setOutcome(e.target.value)}><option value="win">Win</option><option value="loss">Loss</option><option value="be">Break-even</option></Select>
        </div>
        <TextArea placeholder="Notes..." value={sessionNote} onChange={(e) => setSessionNote(e.target.value)} />
        <div style={{ marginTop: 12 }}><Btn onClick={() => { if (!pattern.trim()) { push("Add a pattern name", "danger"); return; } api.addTradingSession({ pattern, outcome, notes: sessionNote }); setPattern(""); setSessionNote(""); push("Session logged", "success"); }}><Plus size={16} /> Log Session</Btn></div>
        {state.trading.sessions.length > 0 && (
          <div className="col g-2" style={{ marginTop: 14, maxHeight: 160, overflowY: "auto" }}>
            {state.trading.sessions.slice(0, 8).map((s) => (
              <div key={s.id} className="row-between t-sm" style={{ background: "var(--divider)", borderRadius: 12, padding: "8px 10px" }}>
                <span>{s.pattern}</span><Badge tone={s.outcome === "win" ? "success" : s.outcome === "loss" ? "danger" : "default"}>{s.outcome}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <div className="section-label">Journal Notes</div>
        <div className="row g-2" style={{ marginBottom: 12 }}>
          <Input placeholder="Quick note..." value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && noteDraft.trim() && (api.addTradingNote(noteDraft.trim()), setNoteDraft(""))} />
          <Btn variant="ghost" icon onClick={() => { if (noteDraft.trim()) { api.addTradingNote(noteDraft.trim()); setNoteDraft(""); } }}><Plus size={14} /></Btn>
        </div>
        <div className="col g-2" style={{ maxHeight: 160, overflowY: "auto" }}>
          {state.trading.notes.map((n) => (
            <div key={n.id} className="row-between t-sm" style={{ background: "var(--divider)", borderRadius: 12, padding: "8px 10px" }}>
              <span>{n.text}</span>
              <div className="row g-2"><span className="t-xs t-faint">{prettyDate(n.date)}</span><button onClick={() => api.deleteTradingNote(n.id)} className="t-faint" style={{ background: "none", border: "none" }}><Trash2 size={13} /></button></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
/* ============================================================
   JOURNAL
   ============================================================ */
function Journal({ state, api, push }) {
  const [mood, setMood] = useState("okay");
  const [text, setText] = useState("");
  const [gratitude, setGratitude] = useState("");
  const submit = () => {
    if (!text.trim()) { push("Write something first", "danger"); return; }
    api.addJournalEntry({ mood, text, gratitude });
    setText(""); setGratitude(""); push("Journal entry saved", "success"); hapticTap();
  };
  return (
    <div className="anim-fadeUp">
      <div style={{ marginBottom: 18 }}><h1 className="greeting-title" style={{ fontSize: 24 }}>Daily Journal</h1><div className="t-sm t-sub">{state.journal.entries.length} entries · private &amp; on this device</div></div>
      <Card style={{ marginBottom: 16 }}>
        <div className="section-label">How are you feeling?</div>
        <div className="row g-2" style={{ marginBottom: 14 }}>
          {MOODS.map((m) => (
            <button key={m.key} onClick={() => setMood(m.key)} className="col center g-1" style={{ flex: 1, padding: "10px 4px", borderRadius: 16, border: "none", background: mood === m.key ? "var(--accent)" : "var(--divider)", color: mood === m.key ? "#fff" : "var(--text-2)" }}>
              <span style={{ fontSize: 20 }}>{m.emoji}</span><span className="t-xs bold">{m.label}</span>
            </button>
          ))}
        </div>
        <Field label="Reflection"><TextArea placeholder="What happened today?" value={text} onChange={(e) => setText(e.target.value)} /></Field>
        <div style={{ marginTop: 10 }}><Field label="Grateful for"><Input placeholder="One thing you're grateful for..." value={gratitude} onChange={(e) => setGratitude(e.target.value)} /></Field></div>
        <div style={{ marginTop: 12 }}><Btn block onClick={submit}><Feather size={16} /> Save Entry</Btn></div>
      </Card>
      <Card>
        <div className="section-label">Past Entries</div>
        {state.journal.entries.length === 0 ? <div className="t-sm t-sub">Your reflections will show up here.</div> : (
          <div className="col g-3" style={{ maxHeight: 400, overflowY: "auto" }}>
            {state.journal.entries.map((e) => (
              <div key={e.id} style={{ background: "var(--divider)", borderRadius: 16, padding: 14 }}>
                <div className="row-between" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{MOODS.find((m) => m.key === e.mood)?.emoji}</span>
                  <div className="row g-2"><span className="t-xs t-faint">{prettyDate(e.date)}</span><button onClick={() => api.deleteJournalEntry(e.id)} className="t-faint" style={{ background: "none", border: "none" }}><Trash2 size={13} /></button></div>
                </div>
                <div className="t-sm">{e.text}</div>
                {e.gratitude && <div className="t-xs t-sub" style={{ marginTop: 6 }}>🙏 {e.gratitude}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ============================================================
   NOTES
   ============================================================ */
function Notes({ state, api, push }) {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const filtered = state.notes.items.filter((n) => !query || `${n.title} ${n.content}`.toLowerCase().includes(query.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => (b.pinned - a.pinned) || (b.updatedAt - a.updatedAt));
  return (
    <div className="anim-fadeUp">
      <div className="row-between" style={{ marginBottom: 18 }}>
        <div><h1 className="greeting-title" style={{ fontSize: 24 }}>Notes</h1><div className="t-sm t-sub">{state.notes.items.length} notes</div></div>
        <Btn onClick={() => setModal({ title: "", content: "", pinned: false })}><Plus size={16} /> New</Btn>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div className="row g-2"><Search size={16} className="t-faint" /><input placeholder="Search notes..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", flex: 1, color: "var(--text-1)" }} /></div>
      </Card>
      {sorted.length === 0 ? <EmptyState icon={<StickyNote size={38} />} title="No notes yet" sub="Capture ideas, lists, or anything worth remembering." /> : (
        <div className="grid grid-2">
          {sorted.map((n) => (
            <Card key={n.id} tap onClick={() => setModal(n)}>
              <div className="row-between" style={{ marginBottom: 6 }}>
                <div className="bold truncate flex-1">{n.title || "Untitled"}</div>
                <button onClick={(e) => { e.stopPropagation(); api.toggleNotePin(n.id); }} style={{ background: "none", border: "none", color: n.pinned ? "var(--accent)" : "var(--text-3)" }}><Pin size={14} fill={n.pinned ? "currentColor" : "none"} /></button>
              </div>
              <div className="t-sm t-sub" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.content || "No content"}</div>
            </Card>
          ))}
        </div>
      )}
      {modal && (
        <Modal title={modal.id ? "Edit Note" : "New Note"} onClose={() => setModal(null)}>
          <Input placeholder="Title" value={modal.title} onChange={(e) => setModal((m) => ({ ...m, title: e.target.value }))} />
          <TextArea placeholder="Write your note..." value={modal.content} onChange={(e) => setModal((m) => ({ ...m, content: e.target.value }))} style={{ minHeight: 160 }} />
          <div className="row g-2">
            <Btn variant="ghost" block onClick={() => setModal(null)}>Cancel</Btn>
            {modal.id && <Btn variant="danger" onClick={() => { api.deleteNote(modal.id); setModal(null); push("Note deleted"); }}><Trash2 size={15} /></Btn>}
            <Btn block onClick={() => { if (modal.id) api.updateNote(modal.id, modal); else api.addNote(modal); setModal(null); push("Note saved", "success"); }}><Check size={16} /> Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   CALENDAR
   ============================================================ */
function Calendar({ state, api, push }) {
  const now = new Date();
  const [viewY, setViewY] = useState(now.getFullYear());
  const [viewM, setViewM] = useState(now.getMonth());
  const [selected, setSelected] = useState(todayKey());
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", time: "" });
  const first = new Date(viewY, viewM, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const keyFor = (d) => `${viewY}-${String(viewM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const eventsOn = (k) => {
    const evs = [];
    state.tasks.filter((x) => x.dueDate === k).forEach((x) => evs.push({ type: "task", title: x.title, done: x.completed }));
    state.goals.filter((g) => g.deadline === k).forEach((g) => evs.push({ type: "goal", title: g.title }));
    state.scheduleEvents.filter((e) => e.date === k).forEach((e) => evs.push({ type: "schedule", title: e.title, time: e.time, id: e.id }));
    return evs;
  };
  const selectedEvents = eventsOn(selected);
  const monthName = first.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const prevMonth = () => { if (viewM === 0) { setViewM(11); setViewY((y) => y - 1); } else setViewM((m) => m - 1); };
  const nextMonth = () => { if (viewM === 11) { setViewM(0); setViewY((y) => y + 1); } else setViewM((m) => m + 1); };
  const saveSchedule = () => {
    if (!draft.title.trim()) { push("Enter a title", "danger"); return; }
    api.addScheduleEvent({ date: selected, title: draft.title.trim(), time: draft.time });
    setDraft({ title: "", time: "" }); setAdding(false); push("Added to calendar", "success");
  };
  return (
    <div className="anim-fadeUp">
      <div style={{ marginBottom: 18 }}><h1 className="greeting-title" style={{ fontSize: 24 }}>Calendar</h1><div className="t-sm t-sub">Tasks, goals &amp; schedule</div></div>
      <Card style={{ marginBottom: 16 }}>
        <div className="row-between" style={{ marginBottom: 14 }}>
          <button onClick={prevMonth} className="t-faint" style={{ background: "none", border: "none" }}><ChevronLeft size={20} /></button>
          <div className="bold">{monthName}</div>
          <button onClick={nextMonth} className="t-faint" style={{ background: "none", border: "none" }}><ChevronRight size={20} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginBottom: 4 }}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="t-xs t-faint center">{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const k = keyFor(d); const evs = eventsOn(k); const isToday = k === todayKey(); const isSelected = k === selected;
            return (
              <button key={i} onClick={() => setSelected(k)} className="col center g-1" style={{ aspectRatio: "1", borderRadius: 12, border: isToday && !isSelected ? "1.5px solid var(--accent)" : "1px solid var(--card-border)", background: isSelected ? "var(--accent)" : "var(--card)", color: isSelected ? "#fff" : "var(--text-1)" }}>
                <span className="t-xs bold">{d}</span>
                {evs.length > 0 && <span style={{ width: 4, height: 4, borderRadius: 999, background: isSelected ? "#fff" : "var(--accent)" }} />}
              </button>
            );
          })}
        </div>
      </Card>
      <Card>
        <div className="row-between" style={{ marginBottom: selectedEvents.length ? 10 : 0 }}>
          <div className="section-label" style={{ margin: 0 }}>{prettyDate(selected)}</div>
          <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => setAdding((a) => !a)}><Plus size={15} /></button>
        </div>
        {adding && (
          <div className="col g-2" style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--divider)" }}>
            <Field label="Title"><Input placeholder="e.g. Dentist appointment" value={draft.title} onChange={(e) => setDraft((s) => ({ ...s, title: e.target.value }))} /></Field>
            <Field label="Time (optional)"><TimeField value={draft.time || "09:00"} onChange={(v) => setDraft((s) => ({ ...s, time: v }))} /></Field>
            <div className="row g-2"><Btn variant="ghost" block onClick={() => setAdding(false)}>Cancel</Btn><Btn block onClick={saveSchedule}><Check size={15} /> Save</Btn></div>
          </div>
        )}
        {selectedEvents.length === 0 && !adding ? <div className="t-sm t-sub">Nothing scheduled.</div> : (
          <div className="col g-2">
            {selectedEvents.map((e, i) => (
              <div key={i} className="row-between t-sm" style={{ background: "var(--divider)", borderRadius: 12, padding: "8px 10px" }}>
                <div className="row g-2" style={{ minWidth: 0 }}>
                  <Badge tone={e.type === "task" ? (e.done ? "success" : "default") : e.type === "goal" ? "warning" : "default"}>{e.type}</Badge>
                  <span className="truncate">{e.title}</span>
                  {e.time && <span className="t-xs t-faint">{e.time}</span>}
                </div>
                {e.type === "schedule" && <button className="t-faint" style={{ background: "none", border: "none", flex: "none" }} onClick={() => api.deleteScheduleEvent(e.id)}><Trash2 size={13} /></button>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ============================================================
   REMINDERS
   ============================================================ */
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function Reminders({ state, api, push }) {
  const [modal, setModal] = useState(null);
  useEffect(() => {
    const iv = setInterval(() => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const key = todayKey();
      state.reminders.forEach((r) => {
        if (!r.enabled) return;
        if (r.time !== hhmm) return;
        if (r.repeat === "weekly" && !r.days.includes(now.getDay())) return;
        if (r.firedFor && r.firedFor[key]) return;
        notifyLocal(r.title, "HayatOS reminder");
        push(`⏰ ${r.title}`, "default");
        api.markReminderFired(r.id, key);
        if (r.repeat === "once") api.updateReminder(r.id, { enabled: false });
      });
    }, 20000);
    return () => clearInterval(iv);
  }, [state.reminders]);
  const empty = () => ({ title: "", time: "09:00", repeat: "daily", days: [], enabled: true });
  const save = (d) => { if (modal.id) api.updateReminder(modal.id, d); else api.addReminder(d); setModal(null); push("Reminder saved", "success"); };
  return (
    <div className="anim-fadeUp">
      <div className="row-between" style={{ marginBottom: 18 }}>
        <div><h1 className="greeting-title" style={{ fontSize: 24 }}>Reminders</h1><div className="t-sm t-sub">{state.reminders.filter((r) => r.enabled).length} active</div></div>
        <Btn onClick={() => setModal(empty())}><Plus size={16} /> Add</Btn>
      </div>
      {state.reminders.length === 0 ? <EmptyState icon={<BellRing size={38} />} title="No reminders yet" sub="Get a native notification while HayatOS is running." /> : (
        <div className="col g-3">
          {state.reminders.map((r) => (
            <Card key={r.id} className="row-between">
              <div className="row g-3">
                <button onClick={() => api.updateReminder(r.id, { enabled: !r.enabled })} style={{ width: 42, height: 24, borderRadius: 999, border: "none", position: "relative", background: r.enabled ? "var(--accent)" : "var(--divider)" }}>
                  <span style={{ position: "absolute", top: 2, left: r.enabled ? 20 : 2, width: 20, height: 20, borderRadius: 999, background: "#fff", transition: "left 150ms ease" }} />
                </button>
                <div><div className="bold t-sm">{r.title}</div><div className="t-xs t-sub">{r.time} · {r.repeat === "weekly" ? r.days.map((d) => WEEKDAYS[d]).join(", ") || "no days" : r.repeat}</div></div>
              </div>
              <div className="row g-1">
                <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => setModal(r)}><Edit2 size={14} /></button>
                <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => api.deleteReminder(r.id)}><Trash2 size={14} /></button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {modal && (
        <Modal title={modal.id ? "Edit Reminder" : "New Reminder"} onClose={() => setModal(null)}>
          <Field label="Title"><Input autoFocus placeholder="e.g. Drink water" value={modal.title} onChange={(e) => setModal((m) => ({ ...m, title: e.target.value }))} /></Field>
          <div className="grid grid-2">
            <Field label="Time"><TimeField value={modal.time} onChange={(v) => setModal((m) => ({ ...m, time: v }))} /></Field>
            <Field label="Repeat"><Select value={modal.repeat} onChange={(e) => setModal((m) => ({ ...m, repeat: e.target.value }))}><option value="once">Once</option><option value="daily">Daily</option><option value="weekly">Weekly</option></Select></Field>
          </div>
          {modal.repeat === "weekly" && (
            <div className="row wrap g-2">
              {WEEKDAYS.map((d, i) => <Chip key={i} active={modal.days.includes(i)} onClick={() => setModal((m) => ({ ...m, days: m.days.includes(i) ? m.days.filter((x) => x !== i) : [...m.days, i] }))}>{d}</Chip>)}
            </div>
          )}
          <div className="row g-3">
            <Btn variant="ghost" block onClick={() => setModal(null)}>Cancel</Btn>
            <Btn block onClick={() => { if (!modal.title.trim()) { push("Title is required", "danger"); return; } save(modal); }}><Check size={16} /> Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   STATISTICS
   ============================================================ */
function MultiLineChart({ labels, lines, height = 190 }) {
  const [active, setActive] = useState(null);
  const n = labels.length;
  const dense = n > 10;
  const W = dense ? Math.max(n * 30, 320) : 320;
  const H = height;
  const pad = 14;
  const xFor = (i) => (n <= 1 ? W / 2 : pad + (i / (n - 1)) * (W - pad * 2));
  const yFor = (v) => H - pad - (Math.max(0, Math.min(100, v)) / 100) * (H - pad * 2);
  const stopSwipe = { onTouchStart: (e) => e.stopPropagation(), onTouchMove: (e) => e.stopPropagation(), onTouchEnd: (e) => e.stopPropagation() };
  return (
    <div>
      <div style={{ overflowX: dense ? "auto" : "visible", WebkitOverflowScrolling: "touch" }} {...(dense ? stopSwipe : {})}>
        <svg viewBox={`0 0 ${W} ${H}`} width={dense ? W : "100%"} height={H} style={{ display: "block" }}>
          {[0, 25, 50, 75, 100].map((g) => <line key={g} x1={pad} x2={W - pad} y1={yFor(g)} y2={yFor(g)} stroke="var(--divider)" strokeWidth="1" />)}
          {lines.map((line) => (
            <path key={line.key} d={line.values.map((v, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(v)}`).join(" ")} fill="none" stroke={line.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {active !== null && <line x1={xFor(active)} x2={xFor(active)} y1={pad} y2={H - pad} stroke="var(--text-3)" strokeWidth="1" strokeDasharray="3,3" />}
          {lines.map((line) => line.values.map((v, i) => (active === i ? <circle key={line.key + i} cx={xFor(i)} cy={yFor(v)} r={4} fill={line.color} stroke="var(--card)" strokeWidth="1.5" /> : null)))}
          {labels.map((l, i) => <rect key={i} x={Math.max(0, xFor(i) - (W / n) / 2)} y={0} width={W / n} height={H} fill="transparent" onClick={() => setActive(i === active ? null : i)} />)}
        </svg>
        {/* Label row lives inside the same scroll container as the chart so it scrolls in
           lockstep — this is what makes each point's date/month identifiable on Month/Year. */}
        <div style={{ display: "flex", width: dense ? W : "100%", marginTop: 4 }}>
          {labels.map((l, i) => (
            <span
              key={i}
              className={`t-xs ${active === i ? "bold" : "t-faint"}`}
              style={{ flex: dense ? `0 0 ${W / n}px` : 1, textAlign: "center", cursor: "pointer" }}
              onClick={() => setActive(i === active ? null : i)}
            >
              {l}
            </span>
          ))}
        </div>
      </div>
      {dense && <div className="t-xs t-faint" style={{ marginTop: 6, textAlign: "center" }}>Scroll sideways to see every {n > 20 ? "day" : "month"} · tap a point to inspect</div>}
      {active !== null && (
        <div className="chart-tooltip">
          <div className="t-xs bold t-sub" style={{ marginBottom: 4 }}>{labels[active]}</div>
          {lines.map((line) => (
            <div key={line.key} className="row-between t-xs" style={{ marginTop: 2 }}>
              <span style={{ color: line.color, fontWeight: 700 }}>● {line.label}</span>
              <span className="bold">{Math.round(line.values[active])}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Statistics({ state, lastNH }) {
  const [mode, setMode] = useState("week");
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState(addDays(todayKey(), -13));
  const [customTo, setCustomTo] = useState(todayKey());
  const key = todayKey();

  let fromKey, toKey, periodLabel;
  if (mode === "day") { fromKey = key; toKey = key; periodLabel = "Today"; }
  else if (mode === "week") { fromKey = addDays(key, -6); toKey = key; periodLabel = "Last 7 Days"; }
  else if (mode === "month") { fromKey = addDays(key, -29); toKey = key; periodLabel = "Last 30 Days"; }
  else if (mode === "year") { fromKey = addDays(key, -364); toKey = key; periodLabel = "Last 12 Months"; }
  else { fromKey = customFrom <= customTo ? customFrom : customTo; toKey = customFrom <= customTo ? customTo : customFrom; periodLabel = `${prettyDate(fromKey)} – ${prettyDate(toKey)}`; }

  const series = buildStatsSeries(state, mode, fromKey, toKey);
  const namazActive = lastNH !== "hobby";
  const lines = [
    { key: "tasks", label: "Tasks", color: STAT_COLORS.tasks, values: series.map((p) => p.tasks) },
    { key: "goals", label: "Goals", color: STAT_COLORS.goals, values: series.map((p) => p.goals) },
    ...(namazActive ? [{ key: "namaz", label: "Namaz", color: STAT_COLORS.namaz, values: series.map((p) => p.namaz) }] : []),
    { key: "hobby", label: "Hobby", color: STAT_COLORS.hobby, values: series.map((p) => p.hobby) },
  ];
  const labels = series.map((p) => p.label);

  const isGood = (k) => dayScore(k, state) >= 60;
  const streak = computeStreak(isGood);
  const longest = Math.max(streak, computeLongest(isGood, lastNDays(90)));
  const periodDays = rangeKeys(fromKey, toKey);
  const focusScore = Math.round(periodDays.reduce((a, k) => a + dayScore(k, state), 0) / periodDays.length);
  const progressPct = Math.round(series.reduce((a, p) => a + (p.tasks + p.goals + p.namaz + p.hobby) / 4, 0) / series.length);
  const productivityScore = Math.round(series.reduce((a, p) => a + (p.tasks * 0.35 + p.namaz * 0.25 + p.hobby * 0.15 + p.goals * 0.25), 0) / series.length);

  const periodTasks = state.tasks.filter((t) => t.dueDate && t.dueDate >= fromKey && t.dueDate <= toKey);
  const tCompleted = periodTasks.filter((t) => t.completed).length;
  const tMissed = periodTasks.filter((t) => !t.completed && t.dueDate < todayKey()).length;
  const tPending = periodTasks.length - tCompleted - tMissed;
  const tTotal = periodTasks.length || 1;

  const focusMin = studyMinutesForRange(state, fromKey, toKey);
  const namazPctPeriod = namazPctForRange(state, fromKey, toKey);
  const hobbyMin = hobbyMinutesForRange(state, fromKey, toKey);

  const buckets = weekdayBuckets(state, fromKey, toKey);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fullDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const maxBucket = Math.max(1, ...buckets);
  let bestIdx = 0; for (let i = 1; i < 7; i++) if (buckets[i] > buckets[bestIdx]) bestIdx = i;
  const bucketAvg = buckets.reduce((a, b) => a + b, 0) / 7;
  const bestDiff = bucketAvg > 0 ? Math.round(((buckets[bestIdx] - bucketAvg) / bucketAvg) * 100) : 0;

  const heatMonth = lastNDays(30);
  let insight = "Keep logging your days consistently to unlock deeper personal insights.";
  { const withNamaz = [], withoutNamaz = [];
    heatMonth.forEach((k) => { const nd = state.namaz[k]; const full = nd && PRAYERS.every((p) => nd[p]); const s = dayScore(k, state); (full ? withNamaz : withoutNamaz).push(s); });
    const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
    const a = avg(withNamaz), b = avg(withoutNamaz);
    if (a !== null && b !== null && b > 2) { const diff = Math.round(((a - b) / b) * 100); if (diff > 8) insight = `You're ${diff}% more productive on days you complete all 5 prayers.`; }
  }

  return (
    <div className="anim-fadeUp">
      <div style={{ marginBottom: 16 }}><h1 className="greeting-title" style={{ fontSize: 24 }}>Statistics</h1><div className="t-sm t-sub">Your progress, at a glance</div></div>

      <div className="row-between g-2" style={{ marginBottom: 16, gap: 8 }}>
        <div className="quick-tools-row" style={{ marginBottom: 0, flex: 1 }}>
          {[["day", "Day"], ["week", "Week"], ["month", "Month"], ["year", "Year"]].map(([m, l]) => (
            <button key={m} className={`chip-scroll ${mode === m ? "active" : ""}`} onClick={() => setMode(m)}>{l}</button>
          ))}
        </div>
        <button className={`chip-scroll ${mode === "custom" ? "active" : ""}`} style={{ flex: "none", display: "flex", alignItems: "center", gap: 5 }} onClick={() => setShowCustom(true)}>
          <CalendarDays size={13} /> Custom
        </button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div className="row-between" style={{ marginBottom: 4 }}>
          <div className="section-label" style={{ margin: 0 }}>Overview</div>
          <span className="t-xs t-sub">{periodLabel}</span>
        </div>
        <div style={{ marginTop: 12 }}>{mode === "day" ? <HourlyTodayChart buckets={hourlyActivityToday(state, key)} /> : <MultiLineChart labels={labels} lines={lines} />}</div>
        <div className="row g-3" style={{ flexWrap: "wrap", marginTop: 14 }}>
          {mode === "day"
            ? [{ key: "tasks", label: "Tasks", color: STAT_COLORS.tasks }, { key: "hobby", label: "Hobby/Study", color: STAT_COLORS.hobby }].map((l) => <span key={l.key} className="t-xs t-sub row g-1" style={{ alignItems: "center" }}><span style={{ width: 8, height: 8, borderRadius: 4, background: l.color, display: "inline-block" }} /> {l.label}</span>)
            : lines.map((l) => <span key={l.key} className="t-xs t-sub row g-1" style={{ alignItems: "center" }}><span style={{ width: 8, height: 8, borderRadius: 4, background: l.color, display: "inline-block" }} /> {l.label}</span>)}
        </div>
      </Card>

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <Card className="stat-tile"><Flame size={15} className="t-faint" /><div className="stat-num">{streak}d</div><div className="stat-label">Streak</div></Card>
        <Card className="stat-tile"><Trophy size={15} className="t-faint" /><div className="stat-num">{longest}d</div><div className="stat-label">Longest</div></Card>
        <Card className="stat-tile"><Target size={15} className="t-faint" /><div className="stat-num">{focusScore}%</div><div className="stat-label">Focus Score</div></Card>
        <Card className="stat-tile"><TrendingUp size={15} className="t-faint" /><div className="stat-num">{progressPct}%</div><div className="stat-label">Progress</div></Card>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <Card>
          <div className="row-between"><div className="section-label" style={{ margin: 0 }}>Tasks Overview</div></div>
          <div className="col g-3" style={{ marginTop: 10 }}>
            <div><div className="row-between t-sm" style={{ marginBottom: 4 }}><span>Completed</span><span className="t-sub">{tCompleted}</span></div><ProgressBar value={(tCompleted / tTotal) * 100} /></div>
            <div><div className="row-between t-sm" style={{ marginBottom: 4 }}><span>Pending</span><span className="t-sub">{tPending}</span></div><ProgressBar value={(tPending / tTotal) * 100} /></div>
            <div><div className="row-between t-sm" style={{ marginBottom: 4 }}><span>Missed</span><span className="t-sub">{tMissed}</span></div><ProgressBar value={(tMissed / tTotal) * 100} /></div>
          </div>
          <div className="t-xs t-faint" style={{ marginTop: 10 }}>Total Tasks: {periodTasks.length}</div>
        </Card>
        <Card className="col center g-2" style={{ alignItems: "center" }}>
          <div className="section-label" style={{ margin: 0, alignSelf: "flex-start" }}>Productivity Score</div>
          <ProgressRing value={productivityScore} label={`${productivityScore}`} size={104} stroke={9} glow={productivityScore >= 75} />
          <div className="t-xs t-sub">out of 100</div>
        </Card>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div className="section-label">Time & Completion</div>
        <div className={`grid ${namazActive ? "grid-3" : "grid-2"}`} style={{ gap: 10, marginTop: 8 }}>
          <div className="col g-1" style={{ alignItems: "center" }}><TimerIcon size={16} className="t-faint" /><span className="bold t-sm">{fmtHM(focusMin)}</span><span className="t-xs t-faint">Focus Time</span></div>
          {namazActive && <div className="col g-1" style={{ alignItems: "center" }}><span style={{ fontSize: 16 }}>🕌</span><span className="bold t-sm">{namazPctPeriod}%</span><span className="t-xs t-faint">Namaz</span></div>}
          <div className="col g-1" style={{ alignItems: "center" }}><Heart size={16} className="t-faint" /><span className="bold t-sm">{fmtHM(hobbyMin)}</span><span className="t-xs t-faint">Hobby Time</span></div>
        </div>
      </Card>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <Card>
          <div className="section-label">Most Productive Day</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>{fullDayNames[bestIdx]}</div>
          <div className="t-xs t-sub">{bestDiff > 0 ? `${bestDiff}% more productive` : "Your most consistent day"}</div>
        </Card>
        <Card>
          <div className="section-label">Weekly Activity</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 54, marginTop: 8 }}>
            {buckets.map((v, i) => (
              <div key={i} className="col g-1" style={{ flex: 1, alignItems: "center" }}>
                <div className="week-bar-track" style={{ height: 40 }}><div className="week-bar-fill" style={{ height: `${(v / maxBucket) * 100}%` }} /></div>
                <span className="t-xs t-faint">{dayNames[i][0]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div className="section-label">30-Day Activity Heatmap</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 5, marginTop: 4 }}>
          {heatMonth.map((k) => { const s = dayScore(k, state); return <div key={k} title={`${k}: ${Math.round(s)}%`} style={{ aspectRatio: "1", borderRadius: 5, background: "var(--accent)", opacity: Math.max(0.08, s / 100) }} />; })}
        </div>
        <div className="row g-3" style={{ marginTop: 10, flexWrap: "wrap" }}>
          <span className="t-xs t-faint row g-1" style={{ alignItems: "center" }}><span style={{ width: 8, height: 8, borderRadius: 3, background: "var(--accent)", opacity: 0.15, display: "inline-block" }} /> Low</span>
          <span className="t-xs t-faint row g-1" style={{ alignItems: "center" }}><span style={{ width: 8, height: 8, borderRadius: 3, background: "var(--accent)", opacity: 0.5, display: "inline-block" }} /> Moderate</span>
          <span className="t-xs t-faint row g-1" style={{ alignItems: "center" }}><span style={{ width: 8, height: 8, borderRadius: 3, background: "var(--accent)", opacity: 1, display: "inline-block" }} /> High</span>
        </div>
      </Card>

      <Card className="liquid-glass">
        <div className="row g-3" style={{ alignItems: "flex-start" }}>
          <span className="prayer-row-icon"><Sparkles size={16} /></span>
          <div>
            <div className="t-xs bold" style={{ color: "var(--accent)" }}>Personal Insight</div>
            <div className="t-sm" style={{ lineHeight: 1.4, marginTop: 2 }}>{insight}</div>
          </div>
        </div>
      </Card>

      {showCustom && (
        <Modal title="Custom Range" onClose={() => setShowCustom(false)} footer={<Btn block onClick={() => { setMode("custom"); setShowCustom(false); }}><Check size={15} /> Apply Range</Btn>}>
          <Field label="From"><DateField value={customFrom} onChange={setCustomFrom} /></Field>
          <Field label="To"><DateField value={customTo} onChange={setCustomTo} /></Field>
        </Modal>
      )}
    </div>
  );
}
/* ============================================================
   PROFILE
   ============================================================ */
function resizeImageToDataUrl(file, size = 200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d");
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2, sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const TIMEZONE_LIST = (() => {
  try { if (typeof Intl.supportedValuesOf === "function") return Intl.supportedValuesOf("timeZone"); } catch (e) {}
  return [
    "UTC", "Asia/Kolkata", "Asia/Karachi", "Asia/Dhaka", "Asia/Dubai", "Asia/Riyadh", "Asia/Istanbul", "Asia/Jakarta",
    "Asia/Kuala_Lumpur", "Asia/Singapore", "Asia/Tokyo", "Asia/Shanghai", "Asia/Hong_Kong", "Asia/Baghdad", "Asia/Tehran",
    "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow", "Africa/Cairo", "Africa/Lagos", "Africa/Johannesburg",
    "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Sao_Paulo",
    "Australia/Sydney", "Pacific/Auckland",
  ];
})();
const THEME_OPTIONS = [
  { key: "auto", label: "Auto (system)", icon: Palette },
  { key: "light", label: "Light — Ivory Bloom", icon: Sun, image: BG_LIGHT, accent: "#B5813B" },
  { key: "dark", label: "Dark — Crimson Rug", icon: Moon, image: BG_DARK, accent: "#E2543F" },
  { key: "walnut", label: "Walnut & Rose", icon: Palette, image: BG_WALNUT, accent: "#C68A3D" },
  { key: "crimson", label: "Crimson Halal", icon: Palette, image: BG_CRIMSON, accent: "#D14A34" },
  { key: "azure", label: "Azure Moonlight", icon: Palette, image: BG_AZURE, accent: "#3E86C9" },
  { key: "jade", label: "Jade Heritage", icon: Palette, image: BG_JADE, accent: "#4F9A6C" },
  { key: "midnight", label: "Midnight — Solid Black", icon: Moon },
  { key: "custom", label: "Your Own Theme", icon: Palette },
];

function EditProfileView({ state, api, push, user, onBack }) {
  const [name, setName] = useState(state.profile.name);
  const [username, setUsername] = useState(state.profile.username);
  const [bio, setBio] = useState(state.profile.bio || "");
  const [location, setLocation] = useState(state.profile.location || "");
  const [dob, setDob] = useState(state.profile.dob || "");
  const [email, setEmail] = useState(user?.email || "");
  const [emailSaving, setEmailSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // null | "ok" | "taken" | error string
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const checkTimer = useRef(null);

  const onPickPhoto = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setUploading(true);
    try { const dataUrl = await resizeImageToDataUrl(f, 240); api.updateProfile({ photoURL: dataUrl }); push("Profile photo updated", "success"); }
    catch (err) { push("Couldn't update photo", "danger"); }
    finally { setUploading(false); }
  };

  const onUsernameChange = (raw) => {
    const clean = normalizeUsername(raw);
    setUsername(clean);
    setUsernameStatus(null);
    clearTimeout(checkTimer.current);
    if (clean === state.profile.username) return; // unchanged, no need to check
    const err = usernameError(clean);
    if (err) { setUsernameStatus(err); return; }
    checkTimer.current = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await FirebaseFirestore.getDocument({ reference: `usernames/${clean}` });
        const takenBy = res && res.snapshot && res.snapshot.data && res.snapshot.data.uid;
        setUsernameStatus(takenBy && takenBy !== user?.uid ? "taken" : "ok");
      } catch (e) { setUsernameStatus(isFirestoreNotFound(e) ? "ok" : null); } // not-found = available; anything else = can't verify yet
      setChecking(false);
    }, 450);
  };

  const save = async () => {
    if (!name.trim()) { push("Name can't be empty", "danger"); return; }
    const cleanUsername = normalizeUsername(username);
    const err = usernameError(cleanUsername);
    if (err) { push(err, "danger"); return; }
    if (usernameStatus === "taken") { push("That username is already taken", "danger"); return; }
    if (cleanUsername !== state.profile.username && user) {
      // Verify + reserve the username. Any failure here must BLOCK the save —
      // silently continuing on error was the bug that let two accounts share a username.
      try {
        const res = await FirebaseFirestore.getDocument({ reference: `usernames/${cleanUsername}` });
        const takenBy = res && res.snapshot && res.snapshot.data && res.snapshot.data.uid;
        if (takenBy && takenBy !== user.uid) { push("That username is already taken", "danger"); setUsernameStatus("taken"); return; }
      } catch (e) {
        if (!isFirestoreNotFound(e)) { push(`Couldn't verify username (${e?.code || e?.message || "unknown error"})`, "danger"); return; }
      }
      try {
        if (state.profile.username) await FirebaseFirestore.deleteDocument({ reference: `usernames/${state.profile.username}` }).catch(() => {});
        await FirebaseFirestore.setDocument({ reference: `usernames/${cleanUsername}`, data: { uid: user.uid }, merge: true });
      } catch (e) {
        push("Couldn't reserve that username — try again", "danger");
        return;
      }
    }
    api.updateProfile({ name: name.trim(), username: cleanUsername, bio: bio.slice(0, 100), location: location.trim(), dob });
    push("Profile updated", "success");
    onBack();
  };

  const changeEmail = async () => {
    const clean = email.trim();
    if (!clean || clean === user?.email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) { push("Enter a valid email", "danger"); return; }
    setEmailSaving(true);
    try {
      await FirebaseAuthentication.updateEmail({ newEmail: clean });
      try { await FirebaseAuthentication.sendEmailVerification(); } catch (e2) {}
      push(`Email updated to ${clean} — check it for a verification link (and check spam)`, "success");
    } catch (e) {
      push(String(e?.code || "").includes("requires-recent-login") ? "Sign out and back in, then try again" : friendlyAuthErrorStandalone(e), "danger");
    } finally { setEmailSaving(false); }
  };

  return (
    <div className="anim-fadeUp">
      <div className="row g-2" style={{ alignItems: "center", marginBottom: 18 }}>
        <button className="icon-btn" onClick={onBack}><ChevronLeft size={18} /></button>
        <h1 className="greeting-title" style={{ fontSize: 22, margin: 0 }}>Edit Profile</h1>
      </div>
      <div className="col g-3">
        <Card strong className="col center g-2" style={{ alignItems: "center", padding: "22px 20px" }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 92, height: 92, borderRadius: 999, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,var(--accent),var(--accent-2))", fontSize: 28, fontWeight: 800, color: "#fff" }}>
              {state.profile.photoURL ? <img src={state.profile.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (name || "?").slice(0, 1).toUpperCase()}
            </div>
            <button onClick={() => fileRef.current && fileRef.current.click()} className="liquid-glass" style={{ position: "absolute", bottom: -2, right: -2, width: 34, height: 34, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", border: "none" }} disabled={uploading}>
              {uploading ? <Loader2 size={14} className="anim-spin" /> : <Camera size={14} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPickPhoto} />
          </div>
          <button className="t-xs" style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 700 }} onClick={() => fileRef.current && fileRef.current.click()}>Change Photo</button>
        </Card>
        <Card>
          <div className="col g-3">
            <Field label="Name"><Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Username">
              <Input placeholder="username" value={username} onChange={(e) => onUsernameChange(e.target.value)} />
              <div className="t-xs" style={{ marginTop: 4, color: usernameStatus === "taken" || (typeof usernameStatus === "string" && usernameStatus !== "ok") ? "var(--danger)" : usernameStatus === "ok" ? "var(--success)" : "var(--text-3)" }}>
                {checking ? "Checking availability…" : usernameStatus === "ok" ? "✓ Available" : usernameStatus === "taken" ? "Already taken — try another" : typeof usernameStatus === "string" ? usernameStatus : "lowercase letters, numbers, _ and . only"}
              </div>
            </Field>
            <Field label={`Bio (${bio.length}/100)`}><Input placeholder="A short line about you" value={bio} onChange={(e) => setBio(e.target.value.slice(0, 100))} /></Field>
            <Field label="Email">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled={user?.isAnonymous || user?.providerId === "google.com"} />
              {email.trim() !== (user?.email || "") && !user?.isAnonymous && (
                <button className="t-xs bold" style={{ background: "none", border: "none", color: "var(--accent)", marginTop: 4 }} onClick={changeEmail} disabled={emailSaving}>{emailSaving ? "Sending…" : "Send confirmation to new email"}</button>
              )}
              {user?.isAnonymous && <div className="t-xs t-faint" style={{ marginTop: 4 }}>Guest account — sign up with email to add one</div>}
              {user?.providerId === "google.com" && <div className="t-xs t-faint" style={{ marginTop: 4 }}>Managed by your Google account</div>}
            </Field>
            <Field label="Location"><Input placeholder="Country / city" value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
            <Field label="Date of Birth"><DateField value={dob || "2000-01-01"} onChange={setDob} yearsRange={YEARS_RANGE_WIDE} /></Field>
            <Btn onClick={save} disabled={checking}><Check size={16} /> Save Changes</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ActivityView({ state, onBack, lastNH }) {
  const [filter, setFilter] = useState("all");
  const lifeLabel = lastNH === "hobby" ? "Hobby" : "Namaz";
  const lifeMatch = lastNH === "hobby" ? /hobby/i : /prayer/i;
  const filtered = state.activity.filter((a) => filter === "all" || a.kind === filter || (filter === "life" && lifeMatch.test(a.text)) || (filter === "tasks" && /task/i.test(a.text)) || (filter === "goals" && /goal/i.test(a.text)));
  const groups = { Today: [], Yesterday: [], Earlier: [] };
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const yStart = todayStart.getTime() - DAY_MS;
  filtered.forEach((a) => { groups[a.ts >= todayStart.getTime() ? "Today" : a.ts >= yStart ? "Yesterday" : "Earlier"].push(a); });
  return (
    <div className="anim-fadeUp">
      <div className="row g-2" style={{ alignItems: "center", marginBottom: 18 }}>
        <button className="icon-btn" onClick={onBack}><ChevronLeft size={18} /></button>
        <h1 className="greeting-title" style={{ fontSize: 22, margin: 0 }}>Activity</h1>
      </div>
      <div className="row g-2 wrap" style={{ marginBottom: 14 }}>
        {[["all", "All"], ["tasks", "Tasks"], ["life", lifeLabel], ["goals", "Goals"]].map(([f, label]) => (
          <button key={f} className={`chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{label}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<CalendarDays size={34} />} title="No activity yet" sub="Complete a task or prayer to see it show up here." />
      ) : Object.entries(groups).filter(([, v]) => v.length).map(([label, items]) => (
        <div key={label} style={{ marginBottom: 16 }}>
          <div className="t-xs t-faint" style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>{label}</div>
          <Card>
            <div className="col">
              {items.map((a, i) => (
                <div key={a.id}>
                  <div className="row-between" style={{ padding: "10px 2px" }}>
                    <div className="row g-2" style={{ alignItems: "center" }}>
                      {a.kind === "success" ? <div className="task-icon"><Check size={14} /></div> : <div className="task-icon"><Sparkles size={14} /></div>}
                      <div>
                        <div className="t-sm bold">{a.text}</div>
                        <div className="t-xs t-faint">{new Date(a.ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</div>
                      </div>
                    </div>
                    {a.xp > 0 && <div className="t-xs bold" style={{ color: "var(--accent)" }}>+{a.xp} XP</div>}
                  </div>
                  {i < items.length - 1 && <div style={{ height: 1, background: "var(--divider)" }} />}
                </div>
              ))}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}

function AchievementsView({ state, onBack }) {
  const list = computeAchievements(state);
  const unlockedCount = list.filter((a) => a.unlocked).length;
  return (
    <div className="anim-fadeUp">
      <div className="row g-2" style={{ alignItems: "center", marginBottom: 18 }}>
        <button className="icon-btn" onClick={onBack}><ChevronLeft size={18} /></button>
        <h1 className="greeting-title" style={{ fontSize: 22, margin: 0 }}>Achievements</h1>
      </div>
      <div className="t-sm t-sub" style={{ marginBottom: 14 }}>Your Badges · {unlockedCount}/{list.length} unlocked</div>
      <div className="grid grid-3" style={{ gap: 12 }}>
        {list.map((a) => (
          <Card key={a.key} className="col center g-1" style={{ alignItems: "center", padding: "18px 8px", opacity: a.unlocked ? 1 : .45 }}>
            <div style={{ fontSize: 30 }}>{a.unlocked ? a.emoji : "🔒"}</div>
            <div className="t-xs bold center">{a.label}</div>
            <div className="t-xs t-faint center">{a.sub}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function friendlyAuthErrorStandalone(e) {
  const code = e && e.code ? String(e.code) : "";
  if (code.includes("email-already-in-use")) return "That email already has an account — try signing in instead.";
  if (code.includes("invalid-email")) return "That email address looks invalid.";
  if (code.includes("weak-password")) return "Password should be at least 6 characters.";
  if (code.includes("user-not-found") || code.includes("wrong-password") || code.includes("invalid-credential")) return "Incorrect email or password.";
  if (code.includes("too-many-requests")) return "Too many attempts — please wait a bit and try again.";
  if (code.includes("network")) return "Network error — check your connection and try again.";
  return "Something went wrong. Please try again.";
}
function SecurityView({ state, api, push, onBack, user }) {
  const p = state.prefs;
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [savingEmail, setSavingEmail] = useState(false);
  // Accounts signed in via Google (or any social provider) don't automatically get a
  // password — Firebase only creates a "password" provider entry when one is explicitly
  // set. Without this, email+password sign-in will always fail with "incorrect password"
  // even though the account and its data are completely fine.
  const hasPasswordProvider = (user?.providerData || []).some((pr) => pr.providerId === "password");
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const setPasswordForAccount = async () => {
    if (!user?.email) { push("No email on this account", "danger"); return; }
    if (newPassword.length < 6) { push("Password must be at least 6 characters", "danger"); return; }
    if (newPassword !== confirmNewPassword) { push("Passwords don't match", "danger"); return; }
    setSavingPassword(true);
    try {
      await FirebaseAuthentication.linkWithEmailAndPassword({ email: user.email, password: newPassword });
      push("Password set — you can now sign in with email + password too", "success");
      setShowSetPassword(false); setNewPassword(""); setConfirmNewPassword("");
    } catch (e) {
      if (String(e?.code || "").includes("requires-recent-login")) push("For security, please sign out and sign back in, then try again.", "danger");
      else push(friendlyAuthErrorStandalone(e), "danger");
    }
    setSavingPassword(false);
  };
  const changePassword = async () => {
    if (!user?.email) { push("No email on this account", "danger"); return; }
    try {
      await FirebaseAuthentication.sendPasswordResetEmail({ email: user.email });
      push(`Reset link sent to ${user.email} — check spam/promotions if it doesn't show up in a minute`, "success");
    } catch (e) { push(friendlyAuthErrorStandalone(e), "danger"); }
  };
  const changeEmail = async () => {
    const clean = newEmail.trim();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) { push("Enter a valid email address", "danger"); return; }
    setSavingEmail(true);
    try {
      await FirebaseAuthentication.updateEmail({ newEmail: clean });
      push(`Email updated to ${clean} — verify it from the link we just sent`, "success");
      setShowEmailChange(false);
      try { await FirebaseAuthentication.sendEmailVerification(); } catch (e) {}
    } catch (e) {
      if (String(e?.code || "").includes("requires-recent-login")) push("For security, please sign out and sign back in, then try changing your email again.", "danger");
      else push(friendlyAuthErrorStandalone(e), "danger");
    }
    setSavingEmail(false);
  };
  return (
    <div className="anim-fadeUp">
      <div className="row g-2" style={{ alignItems: "center", marginBottom: 18 }}>
        <button className="icon-btn" onClick={onBack}><ChevronLeft size={18} /></button>
        <h1 className="greeting-title" style={{ fontSize: 22, margin: 0 }}>Security</h1>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div className="section-label">Account Security</div>
        {hasPasswordProvider ? (
          <a className="nav-item" style={{ cursor: "pointer" }} onClick={changePassword}><KeyIcon /><span>Change Password</span></a>
        ) : (
          <a className="nav-item" style={{ cursor: "pointer" }} onClick={() => setShowSetPassword(true)}>
            <KeyIcon />
            <div className="flex-1">
              <div className="t-sm bold">Set a Password</div>
              <div className="t-xs t-faint">You signed in with Google — add a password to also sign in with email</div>
            </div>
          </a>
        )}
        <a className="nav-item" style={{ cursor: "pointer" }} onClick={() => { setNewEmail(user?.email || ""); setShowEmailChange(true); }}><Bell size={18} /><span>Change Email Address</span></a>
      </Card>
      {showSetPassword && (
        <Modal title="Set a Password" onClose={() => setShowSetPassword(false)} footer={<Btn block onClick={setPasswordForAccount} disabled={savingPassword}>{savingPassword ? "Saving..." : "Set Password"}</Btn>}>
          <div className="t-xs t-sub">This adds email + password sign-in to your existing account ({user?.email}) — your data stays exactly the same.</div>
          <Field label="New Password"><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" /></Field>
          <Field label="Confirm Password"><Input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Re-enter password" /></Field>
        </Modal>
      )}
      {showEmailChange && (
        <Modal title="Change Email Address" onClose={() => setShowEmailChange(false)} footer={<Btn block onClick={changeEmail} disabled={savingEmail}>{savingEmail ? "Saving..." : "Save & Send Verification"}</Btn>}>
          <Field label="New Email"><Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="you@example.com" /></Field>
          <div className="t-xs t-sub">You'll get a verification link at the new address — check spam if it doesn't arrive within a minute.</div>
        </Modal>
      )}
      <div className="t-xs t-faint center" style={{ marginTop: 14 }}><ShieldCheck size={12} style={{ verticalAlign: "-2px" }} /> Your data is encrypted in transit and only synced to your own account.</div>
    </div>
  );
}
function KeyIcon() { return <SettingsIcon size={17} />; }

function Profile({ state, api, push, user, onSignOut, syncStatus, onNav, lastNH }) {
  const [view, setView] = useState("main");
  const back = () => setView("main");
  if (view === "edit") return <EditProfileView state={state} api={api} push={push} user={user} onBack={back} />;
  if (view === "activity") return <ActivityView state={state} onBack={back} lastNH={lastNH} />;
  if (view === "achievements") return <AchievementsView state={state} onBack={back} />;
  if (view === "security") return <SecurityView state={state} api={api} push={push} onBack={back} user={user} />;

  const namazMode = lastNH !== "hobby";
  const initials = (state.profile.name || user?.email || "?").trim().slice(0, 1).toUpperCase();
  const { level, into, need, pct } = levelFromXP(state.profile.xp);
  const namazIsComplete = (k) => { const d = state.namaz[k]; return !!d && PRAYERS.every((p) => d[p]); };
  const namazStreak = computeStreak(namazIsComplete);
  const hobbyStreak = Math.max(0, ...(state.hobbies || []).map((h) => { const days = new Set((h.sessions || []).map((s) => s.date)); return computeStreak((k) => days.has(k)); }), 0);
  const streak = namazMode ? namazStreak : hobbyStreak;
  const tasksDone = state.tasks.filter((t) => t.completed).length;
  const key = todayKey();
  const namazToday = state.namaz[key] ? PRAYERS.filter((p) => state.namaz[key][p]).length : 0;
  const hobbySessionsToday = (state.hobbies || []).reduce((a, h) => a + (h.sessions || []).filter((s) => s.date === key).length, 0);
  const goalsCount = state.goals.length;
  const productivity = Math.round((dayScore(key, state) + (state.goals.length ? state.goals.reduce((a, g) => a + g.progress, 0) / state.goals.length : 0)) / (state.goals.length ? 2 : 1));
  const joined = new Date(state.profile.joinedAt || Date.now());

  const NAV_ITEMS = [
    { key: "edit", icon: Edit2, label: "Edit Profile", sub: "Update your personal information" },
    { key: "activity", icon: RotateCcw, label: "Activity", sub: "Your recent activity and progress" },
    { key: "achievements", icon: Star, label: "Achievements", sub: "Badges and milestones you earned", soon: true },
    { key: "statistics-nav", icon: BarChart3, label: "Statistics", sub: "Detailed insights and performance" },
    { key: "settings-nav", icon: SettingsIcon, label: "Account Settings", sub: "Manage your account preferences" },
    { key: "security", icon: ShieldCheck, label: "Security", sub: "Password, biometrics and privacy" },
    { key: "settings-nav", icon: Cloud, label: "Backup & Sync", sub: "Cloud sync and data backup" },
  ];

  return (
    <div className="anim-fadeUp">
      <div style={{ marginBottom: 16 }}>
        <h1 className="greeting-title" style={{ fontSize: 24 }}>Profile</h1>
        <div className="t-sm t-sub row g-1">{syncStatus === "synced" ? <><Cloud size={13} /> Synced to your account</> : syncStatus === "syncing" ? <><Loader2 size={13} className="anim-spin" /> Syncing…</> : <><CloudOff size={13} /> Offline — will sync when online</>}</div>
      </div>
      <div className="col g-3">
        {user && user.emailVerified === false && (
          <Card style={{ padding: "12px 16px", background: "color-mix(in srgb, var(--warning, #d97706) 14%, var(--card))" }}>
            <div className="row-between" style={{ alignItems: "center", gap: 10 }}>
              <div className="row g-2" style={{ alignItems: "center", minWidth: 0 }}>
                <Bell size={16} className="t-faint" />
                <div className="t-xs bold">Verify your email — check your inbox for the link.</div>
              </div>
              <button className="t-xs bold" style={{ background: "none", border: "none", color: "var(--accent)", flex: "none" }} onClick={() => { FirebaseAuthentication.sendEmailVerification().then(() => push("Verification email sent — check spam/promotions too", "success")).catch((e) => push(friendlyAuthErrorStandalone(e), "danger")); }}>Resend</button>
            </div>
          </Card>
        )}
        <Card strong style={{ padding: "22px 20px" }}>
          <div className="row g-3" style={{ alignItems: "center" }}>
            <div style={{ position: "relative", flex: "none" }}>
              <div style={{ width: 72, height: 72, borderRadius: 999, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,var(--accent),var(--accent-2))", fontSize: 24, fontWeight: 800, color: "#fff" }}>
                {state.profile.photoURL ? <img src={state.profile.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
              </div>
              <div className="liquid-glass" style={{ position: "absolute", bottom: -2, right: -2, width: 26, height: 26, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", border: "none" }}><Camera size={11} /></div>
            </div>
            <div className="flex-1" style={{ minWidth: 0 }}>
              <div className="row g-2" style={{ alignItems: "center" }}>
                <div className="bold truncate" style={{ fontSize: 17 }}>{state.profile.name || "Add your name"}</div>
                <Badge>Lvl {level}</Badge>
              </div>
              {state.profile.username && <div className="t-sm t-sub truncate">@{state.profile.username}</div>}
              {state.profile.bio && <div className="t-xs t-faint truncate" style={{ marginTop: 2 }}>{state.profile.bio}</div>}
            </div>
          </div>
          <div style={{ margin: "14px 0 4px" }}>
            <div className="row-between t-xs t-faint" style={{ marginBottom: 4 }}><span>Level {level}</span><span>{into}/{need} XP</span></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
          </div>
          <div className="row g-2 wrap" style={{ marginTop: 10 }}>
            <Badge><CalendarDays size={11} /> Joined {joined.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</Badge>
            <Badge><Flame size={11} /> {streak}-day streak</Badge>
          </div>
        </Card>

        <div className="grid grid-4" style={{ gap: 8 }}>
          <Card className="col center g-1" style={{ alignItems: "center", padding: "14px 6px" }}><div className="bold" style={{ fontSize: 18 }}>{productivity}%</div><div className="t-xs t-faint center">Productivity</div></Card>
          <Card className="col center g-1" style={{ alignItems: "center", padding: "14px 6px" }}><div className="bold" style={{ fontSize: 18 }}>{tasksDone}</div><div className="t-xs t-faint center">Tasks Done</div></Card>
          <Card className="col center g-1" style={{ alignItems: "center", padding: "14px 6px" }}>{namazMode ? (<><div className="bold" style={{ fontSize: 18 }}>{namazToday}/5</div><div className="t-xs t-faint center">Prayers</div></>) : (<><div className="bold" style={{ fontSize: 18 }}>{hobbySessionsToday}</div><div className="t-xs t-faint center">Hobby Sessions</div></>)}</Card>
          <Card className="col center g-1" style={{ alignItems: "center", padding: "14px 6px" }}><div className="bold" style={{ fontSize: 18 }}>{goalsCount}</div><div className="t-xs t-faint center">Goals</div></Card>
        </div>

        <Card style={{ padding: 6 }}>
          <div className="col">
            {NAV_ITEMS.map((it, i) => (
              <div key={it.label}>
                <a className="nav-item" style={{ cursor: "pointer", padding: "12px 10px" }} onClick={() => it.soon ? push(`${it.label} is coming soon`, "default") : (it.key.endsWith("-nav") ? onNav && onNav(it.key.replace("-nav", "")) : setView(it.key))}>
                  <it.icon size={17} />
                  <div className="flex-1">
                    <div className="t-sm bold">{it.label}</div>
                    <div className="t-xs t-faint">{it.sub}</div>
                  </div>
                  <ChevronRight size={16} className="t-faint" />
                </a>
                {i < NAV_ITEMS.length - 1 && <div style={{ height: 1, background: "var(--divider)", margin: "0 10px" }} />}
              </div>
            ))}
          </div>
        </Card>

        <Btn variant="ghost" block onClick={onSignOut}><LogOut size={15} /> Sign Out</Btn>
      </div>
    </div>
  );
}

/* ============================================================
   SETTINGS
   ============================================================ */
function CustomThemeCreator({ state, api, push }) {
  const ct = state.customTheme || { mode: "color", color: "#3A2A1A", imageDataUrl: "", accent: "#B5813B" };
  const [mode, setMode] = useState(ct.mode);
  const [color, setColor] = useState(ct.color);
  const [imageDataUrl, setImageDataUrl] = useState(ct.imageDataUrl);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const onPickPhoto = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBusy(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      setImageDataUrl(dataUrl);
      const accent = await averageColorFromImage(dataUrl);
      api.setCustomTheme({ mode: "image", imageDataUrl: dataUrl, accent });
      setBusy(false);
      push("Photo theme ready — tap Apply below", "success");
    };
    reader.readAsDataURL(file);
  };

  const apply = () => {
    if (mode === "color") api.setCustomTheme({ mode: "color", color, accent: color });
    api.setTheme("custom");
    hapticTap(); push("Your theme is live", "success");
  };

  return (
    <div className="col g-3">
      <div className="row g-2">
        <button type="button" className={`chip ${mode === "color" ? "active" : ""}`} onClick={() => setMode("color")}>Solid Color</button>
        <button type="button" className={`chip ${mode === "image" ? "active" : ""}`} onClick={() => setMode("image")}>Photo</button>
      </div>
      {mode === "color" ? (
        <div className="row g-3" style={{ alignItems: "center" }}>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 52, height: 40, border: "none", borderRadius: 10, background: "none" }} />
          <div className="t-sm t-sub">Pick any color — text &amp; accents adjust automatically for readability.</div>
        </div>
      ) : (
        <div className="col g-2">
          {imageDataUrl && <img src={imageDataUrl} alt="" style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 14 }} />}
          <Btn variant="ghost" onClick={() => fileRef.current && fileRef.current.click()} disabled={busy}>
            {busy ? <Loader2 size={15} className="anim-spin" /> : <Camera size={15} />} {imageDataUrl ? "Change Photo" : "Upload Photo"}
          </Btn>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPickPhoto} />
          <div className="t-xs t-faint">We sample the photo's colors to build your theme automatically.</div>
        </div>
      )}
      <Btn onClick={apply} disabled={mode === "image" && !imageDataUrl}><Check size={15} /> Apply as My Theme</Btn>
    </div>
  );
}
// Proper tilt-compensated compass heading — using just `alpha` (as before) only works
// when the phone is lying flat on a table. Held upright (how everyone actually checks
// a Qibla direction), alpha alone drifts wildly; this combines alpha+beta+gamma the way
// the device's real rotation matrix does, so it stays accurate regardless of tilt.
function tiltCompensatedHeading(alpha, beta, gamma) {
  if (alpha == null || beta == null || gamma == null) return null;
  const screenAngle = (window.screen && window.screen.orientation && typeof window.screen.orientation.angle === "number")
    ? window.screen.orientation.angle
    : (typeof window.orientation === "number" ? window.orientation : 0);
  // Device lying flat (on a table): beta/gamma ≈ 0, and the tilt-compensated formula below
  // is degenerate right at that point (its Vx/Vy vector collapses to ~0,0) — which is exactly
  // why flat-on-a-table stopped responding. Flat needs a simpler heading calc, but it is NOT
  // simply `alpha` — this device-orientation `alpha` axis doesn't line up 1:1 with compass
  // bearing; working out the exact limit of the formula below as beta/gamma→0 gives
  // heading = 270° − alpha (that mismatch, not a compass bug, is what was showing
  // west-as-east: using raw alpha directly was off by a mirror + 90°).
  if (Math.abs(beta) < 12 && Math.abs(gamma) < 12) {
    return (((270 - alpha - screenAngle) % 360) + 360) % 360;
  }
  const d2r = Math.PI / 180;
  const a = alpha * d2r, b = beta * d2r, g = gamma * d2r;
  const cA = Math.cos(a), sA = Math.sin(a);
  const cB = Math.cos(b), sB = Math.sin(b);
  const cG = Math.cos(g), sG = Math.sin(g);
  const Vx = -cA * sG - sA * sB * cG;
  const Vy = -sA * sG + cA * sB * cG;
  // Genuinely unstable only right near vertical/edge-on — a much tighter guard than before,
  // since the wide one was also swallowing perfectly good near-flat readings.
  if (Math.hypot(Vx, Vy) < 0.02) return null;
  let heading = Math.atan2(Vx, Vy) * (180 / Math.PI);
  if (heading < 0) heading += 360;
  // Correct for the current screen rotation — without this, tilting/rotating the phone in
  // hand (as opposed to leaving it flat on a table) throws the reading off by the screen's
  // rotation angle.
  heading = (heading - screenAngle + 360) % 360;
  return heading;
}
function QiblaView({ onBack }) {
  const [bearing, setBearing] = useState(null);
  const [heading, setHeading] = useState(null);
  const [status, setStatus] = useState("Requesting location…");

  useEffect(() => {
    (async () => {
      const loc = await getCurrentLocation();
      if (!loc) { setStatus("Location permission is needed to find the Qibla direction."); return; }
      setBearing(qiblaBearing(loc.lat, loc.lng));
      setStatus(null);
    })();
  }, []);

  useEffect(() => {
    let smoothed = null;
    let gotAbsolute = false;
    let fallbackTimer = null;

    const applyHeading = (raw) => {
      if (raw == null || Number.isNaN(raw)) return;
      raw = ((raw % 360) + 360) % 360;
      if (smoothed == null) { smoothed = raw; }
      else {
        // shortest-path circular smoothing so it doesn't spin the long way round at the 0/360 wrap
        let diff = raw - smoothed;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        if (Math.abs(diff) < 0.6) return; // deadzone — ignore sub-degree sensor jitter entirely
        smoothed = (smoothed + diff * 0.15 + 360) % 360;
      }
      setHeading(smoothed);
    };

    const onAbsolute = (e) => {
      gotAbsolute = true;
      if (fallbackHandlerBound) { window.removeEventListener("deviceorientation", onRelative); fallbackHandlerBound = false; }
      const h = e.webkitCompassHeading != null ? e.webkitCompassHeading : tiltCompensatedHeading(e.alpha, e.beta, e.gamma);
      applyHeading(h);
    };
    const onRelative = (e) => {
      if (gotAbsolute) return; // absolute is now driving — ignore drifting relative values
      const h = e.webkitCompassHeading != null ? e.webkitCompassHeading : (e.absolute ? tiltCompensatedHeading(e.alpha, e.beta, e.gamma) : null);
      if (h != null) applyHeading(h);
    };

    let fallbackHandlerBound = false;
    const bindFallback = () => { if (!gotAbsolute && !fallbackHandlerBound) { window.addEventListener("deviceorientation", onRelative); fallbackHandlerBound = true; } };

    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      // iOS Safari — needs an explicit permission prompt; gives webkitCompassHeading directly (already true-north).
      DeviceOrientationEvent.requestPermission().then((r) => { if (r === "granted") window.addEventListener("deviceorientation", onRelative); }).catch(() => {});
    } else {
      window.addEventListener("deviceorientationabsolute", onAbsolute);
      fallbackTimer = setTimeout(bindFallback, 800); // only fall back if absolute never shows up
    }
    return () => {
      window.removeEventListener("deviceorientationabsolute", onAbsolute);
      window.removeEventListener("deviceorientation", onRelative);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const dialRotation = -(heading || 0);
  const DIAL_R = 78; // px, distance of labels/marker from center of the 180px circle
  const posOnRing = (angleDeg) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { left: `calc(50% + ${DIAL_R * Math.sin(rad)}px)`, top: `calc(50% - ${DIAL_R * Math.cos(rad)}px)` };
  };

  return (
    <div className="anim-fadeUp">
      <div className="row g-2" style={{ alignItems: "center", marginBottom: 18 }}>
        <button className="icon-btn" onClick={onBack}><ChevronLeft size={18} /></button>
        <h1 className="greeting-title" style={{ fontSize: 22, margin: 0 }}>Qibla</h1>
      </div>
      {status ? (
        <EmptyState icon={<LayoutGrid size={34} />} title="Locating…" sub={status} />
      ) : (
        <Card className="col center g-3" style={{ alignItems: "center", padding: "34px 20px" }}>
          <div style={{ position: "relative", width: 180, height: 180 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 999, border: "2px solid var(--card-border)" }} />
            {/* Fixed marker at the top — always represents the direction your phone is physically facing right now. */}
            <div style={{ position: "absolute", top: -3, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "10px solid var(--text-1)", zIndex: 2 }} />
            {/* The dial itself rotates like a real compass card — its N/E/S/W and the Ka'bah marker
                stay pinned to their true-world directions no matter which way you turn the phone. */}
            <div style={{ position: "absolute", inset: 0, transform: `rotate(${dialRotation}deg)`, transition: "transform 150ms ease" }}>
              {["N", "E", "S", "W"].map((d, i) => (
                <div key={d} className="t-xs t-faint bold" style={{ position: "absolute", ...posOnRing(i * 90), transform: "translate(-50%,-50%)" }}>{d}</div>
              ))}
              {bearing != null && (
                <div style={{ position: "absolute", ...posOnRing(bearing), transform: "translate(-50%,-50%)", fontSize: 26, lineHeight: 1 }} title="Ka'bah">🕋</div>
              )}
            </div>
          </div>
          <div className="t-sm t-sub center">
            {heading == null
              ? "Move your phone in a figure-8 to calibrate the compass"
              : (Math.abs(((bearing - heading + 540) % 360) - 180) < 8
                  ? "You're facing the Ka'bah 🕋"
                  : "Turn until the Ka'bah icon lines up with the top marker")}
          </div>
        </Card>
      )}
    </div>
  );
}
// Gallery presets ride on the existing "custom" theme mechanism (background image + one
// accent colour, everything else derived automatically) instead of needing bespoke CSS
// per image — same infra, just pre-filled.
const THEME_GALLERY = [
  { name: "App Default", items: [
    { key: "midnight", label: "Midnight", color: "#0A0A0A", accent: "#E0B060" },
    { key: "paper-white", label: "Paper", color: "#FFFFFF", accent: "#8A6D3B" },
  ] },
  { name: "Cars", items: [
    { key: "car-noir-estate", label: "Noir Estate", image: "./img/bg-car-noir-estate.jpg", accent: "#C9A15A" },
    { key: "car-baroque-nights", label: "Baroque Nights", image: "./img/bg-car-baroque-nights.jpg", accent: "#D9A441" },
    { key: "car-misty-ridge", label: "Misty Ridge", image: "./img/bg-car-misty-ridge.jpg", accent: "#3FC1D6" },
    { key: "car-raging-bull", label: "Raging Bull", image: "./img/bg-car-raging-bull.jpg", accent: "#D4AF37" },
    { key: "car-sunset-blossom", label: "Sunset Blossom", image: "./img/bg-car-sunset-blossom.jpg", accent: "#E58B6D" },
    { key: "car-silver-star", label: "Silver Star", image: "./img/bg-car-silver-star.jpg", accent: "#4A7FA6" },
    { key: "car-rosso-corsa", label: "Rosso Corsa", image: "./img/bg-car-rosso-corsa.jpg", accent: "#CE1126" },
    { key: "car-rain-drift", label: "Rain Drift", image: "./img/bg-car-rain-drift.jpg", accent: "#33564A" },
    { key: "car-midnight-bmw", label: "Midnight BMW", image: "./img/bg-car-midnight-bmw.jpg", accent: "#4FC3F7" },
  ] },
  { name: "Vintage", items: [
    { key: "vintage-rose-garden", label: "Rose Garden", image: "./img/bg-vintage-rose-garden.jpg", accent: "#D68FA3" },
    { key: "vintage-cottage-charm", label: "Cottage Charm", image: "./img/bg-vintage-cottage-charm.jpg", accent: "#C79A7A" },
    { key: "vintage-golden-bloom", label: "Golden Bloom", image: "./img/bg-vintage-golden-bloom.jpg", accent: "#E8B074" },
    { key: "vintage-petals-and-paws", label: "Petals & Paws", image: "./img/bg-vintage-petals-and-paws.jpg", accent: "#E8A0B4" },
    { key: "vintage-silent-swan", label: "Silent Swan", image: "./img/bg-vintage-silent-swan.jpg", accent: "#A45A72" },
    { key: "vintage-bougainvillea-wall", label: "Bougainvillea Wall", image: "./img/bg-vintage-bougainvillea-wall.jpg", accent: "#C2368C" },
    { key: "vintage-rose-whisper", label: "Rose Whisper", image: "./img/bg-vintage-rose-whisper.jpg", accent: "#CE8CA0" },
  ] },
  { name: "Signature", items: [
    { key: "signature-snow-leopard", label: "Snow Leopard", image: "./img/bg-signature-snow-leopard.jpg", accent: "#6E90B8" },
  ] },
];
function ThemeView({ state, api, push, onBack }) {
  const CLASSIC = THEME_OPTIONS.filter((t) => ["light", "dark", "walnut", "crimson", "azure", "jade"].includes(t.key));
  const CUSTOM = THEME_OPTIONS.filter((t) => t.key === "custom");
  const AUTO = THEME_OPTIONS.filter((t) => t.key === "auto");
  const activeGalleryKey = state.theme;
  const applyPreset = (item) => {
    api.setTheme(item.key);
    hapticTap();
    push(`${item.label} applied`, "success");
  };
  const row = (t) => (
    <button key={t.key} onClick={() => { api.setTheme(t.key); hapticTap(); }} className="row-between" style={{ padding: "10px 14px", borderRadius: 14, border: "1px solid var(--card-border)", background: state.theme === t.key ? "color-mix(in srgb, var(--accent) 16%, var(--card))" : "var(--card)" }}>
      <span className="row g-2 t-sm bold"><t.icon size={15} /> {t.label}</span>
      {state.theme === t.key && <Check size={15} color="var(--accent)" />}
    </button>
  );
  const tile = (t) => (
    <button
      key={t.key}
      onClick={() => { api.setTheme(t.key); hapticTap(); push(`${t.label} applied`, "success"); }}
      className={`theme-gallery-tile${t.color === "#FFFFFF" ? " theme-gallery-tile-light" : ""}`}
      style={t.image
        ? { backgroundImage: `url("${t.image}")`, borderColor: state.theme === t.key ? t.accent : "var(--card-border)" }
        : { backgroundColor: t.color, borderColor: state.theme === t.key ? t.accent : "var(--card-border)" }}
    >
      <span className="theme-gallery-tile-label">{t.label}</span>
      {state.theme === t.key && <span className="theme-gallery-tile-check" style={{ background: t.accent }}><Check size={12} color="#fff" /></span>}
    </button>
  );
  return (
    <div className="anim-fadeUp">
      <div className="row g-2" style={{ alignItems: "center", marginBottom: 18 }}>
        <button className="icon-btn" onClick={onBack}><ChevronLeft size={18} /></button>
        <h1 className="greeting-title" style={{ fontSize: 22, margin: 0 }}>Theme</h1>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div className="col g-2">{AUTO.map(row)}</div>
      </Card>
      <div className="t-xs t-faint" style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", margin: "0 0 8px" }}>Persian</div>
      <div className="grid grid-2" style={{ gap: 10, marginBottom: 16 }}>{CLASSIC.map(tile)}</div>
      <div className="t-xs t-faint" style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", margin: "0 0 8px" }}>Custom</div>
      <Card style={{ marginBottom: 16 }}>
        <div className="col g-2" style={{ marginBottom: 10 }}>{CUSTOM.map(row)}</div>
        <CustomThemeCreator state={state} api={api} push={push} />
      </Card>

      {THEME_GALLERY.map((cat) => (
        <div key={cat.name}>
          <div className="t-xs t-faint" style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", margin: "0 0 8px" }}>{cat.name}</div>
          <div className="grid grid-2" style={{ gap: 10, marginBottom: 16 }}>
            {cat.items.map((item) => (
              <button
                key={item.key}
                onClick={() => applyPreset(item)}
                className="theme-gallery-tile"
                style={{ backgroundImage: `url("${item.image}")`, borderColor: activeGalleryKey === item.key ? item.accent : "var(--card-border)" }}
              >
                <span className="theme-gallery-tile-label">{item.label}</span>
                {activeGalleryKey === item.key && <span className="theme-gallery-tile-check" style={{ background: item.accent }}><Check size={12} color="#fff" /></span>}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
function Settings({ state, api, push, onNav, user, onSignOut }) {
  const [view, setView] = useState("main");
  const s = state.appSettings || { haptics: true, notifications: true };
  const p = state.prefs;
  const { level, pct } = levelFromXP(state.profile.xp);
  const setPref = api.setPref;

  const backupToDownloads = () => backupStateToDownloads(state, push);
  const [locSaving, setLocSaving] = useState(false);
  const [locName, setLocName] = useState(state.profile.location || "");
  useEffect(() => { setLocName(state.profile.location || ""); }, [state.profile.location]);
  const detectLocation = async () => {
    setLocSaving(true);
    const loc = await getCurrentLocation();
    if (!loc) { setLocSaving(false); push("Location permission denied", "danger"); return; }
    const name = await reverseGeocode(loc.lat, loc.lng);
    setLocSaving(false);
    api.updateProfile({ location: name || `${loc.lat.toFixed(3)}, ${loc.lng.toFixed(3)}`, coords: loc });
    push("Location updated", "success");
  };
  const saveLocationName = () => { api.updateProfile({ location: locName.trim() }); push("Location saved", "success"); };
  const importFileRef = useRef(null);
  const onImportFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { const data = JSON.parse(reader.result); api.importState(data); push("Data imported", "success"); }
      catch (err) { push("That file couldn't be read", "danger"); }
    };
    reader.readAsText(f);
  };
  const syncNow = async () => {
    if (!user) { push("Sign in to sync", "danger"); return; }
    if (!navigator.onLine) { push("You're offline — will sync automatically once connected", "danger"); return; }
    try { await FirebaseFirestore.setDocument({ reference: `users/${user.uid}/appstate/main`, data: { data: JSON.stringify(state), updatedAt: Date.now() }, merge: true }); push("Synced", "success"); }
    catch (e) { push("Sync failed", "danger"); }
  };
  const deleteAccount = async () => {
    if (!confirm("This permanently deletes your HayatOS account and data. Are you sure?")) return;
    if (!confirm("This can't be undone. Delete everything?")) return;
    try {
      if (user) {
        await FirebaseFirestore.deleteDocument({ reference: `users/${user.uid}/appstate/main` }).catch(() => {});
        if (state.profile.username) await FirebaseFirestore.deleteDocument({ reference: `usernames/${state.profile.username}` }).catch(() => {});
      }
      onSignOut && onSignOut();
      push("Account deleted", "success");
    } catch (e) { push("Couldn't delete account", "danger"); }
  };
  const changePassword = async () => {
    if (!user?.email) { push("No email on this account", "danger"); return; }
    try {
      await FirebaseAuthentication.sendPasswordResetEmail({ email: user.email });
      push(`Reset link sent to ${user.email} — check spam/promotions if it doesn't show up in a minute`, "success");
    } catch (e) { push(friendlyAuthErrorStandalone(e), "danger"); }
  };
  const soon = (label) => push(`${label} — coming soon`);

  // These views are declared AFTER every hook above so the hook count/order never
  // changes between renders (returning early before a hook is what was crashing
  // Theme / Qibla with a blank white screen).
  if (view === "theme") return <ThemeView state={state} api={api} push={push} onBack={() => setView("main")} />;
  if (view === "qibla") return <QiblaView onBack={() => setView("main")} />;

  return (
    <div className="anim-fadeUp">
      <div style={{ marginBottom: 18 }}>
        <h1 className="greeting-title" style={{ fontSize: 24 }}>Settings</h1>
        <div className="t-sm t-sub">Customize how HayatOS looks and behaves</div>
      </div>

      {/* HayatOS Personalization hero card */}
      <Card strong style={{ marginBottom: 18, padding: "20px 20px", background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 22%, var(--card-strong)), var(--card-strong))" }}>
        <div className="row-between" style={{ alignItems: "flex-start" }}>
          <div>
            <div className="t-xs" style={{ textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 800, color: "var(--accent)" }}>HayatOS Personalization</div>
            <div className="bold" style={{ fontSize: 18, marginTop: 4 }}>Level {level} · {state.profile.name || "Your journey"}</div>
            <div className="t-xs t-sub" style={{ marginTop: 2 }}>Keep completing tasks, prayers &amp; goals to level up</div>
          </div>
          <div className="fab" style={{ width: 44, height: 44, borderRadius: 16, flex: "none" }}><Sparkles size={19} /></div>
        </div>
        <div className="progress-track" style={{ marginTop: 14 }}><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
      </Card>

      <SettingsSection title="Account" icon={User}>
        <SettingsActionRow icon={User} label="Profile" sub="Name & bio, profile picture, email" onClick={() => onNav && onNav("profile")} />
        <SettingsActionRow icon={SettingsIcon} label="Change Password" onClick={changePassword} />
        <SettingsActionRow icon={LogOut} label="Sign out" onClick={onSignOut} />
        <SettingsActionRow icon={Trash2} label="Delete Account" onClick={deleteAccount} danger />
      </SettingsSection>

      <SettingsSection title="Appearance" icon={Palette}>
        <SettingsActionRow icon={Palette} label="Theme" sub={THEME_OPTIONS.find((t) => t.key === state.theme)?.label || THEME_GALLERY.flatMap((c) => c.items).find((t) => t.key === state.theme)?.label || "System"} onClick={() => setView("theme")} />
      </SettingsSection>

      <SettingsSection title="Notifications" icon={Bell}>
        <SettingsToggleRow icon={Bell} label="Notifications" checked={s.notifications !== false} onChange={(v) => { api.setAppSetting({ notifications: v }); push(v ? "Notifications on" : "Notifications off — all reminders paused", v ? "success" : "default"); }} />
        <div style={{ opacity: s.notifications === false ? 0.4 : 1, pointerEvents: s.notifications === false ? "none" : "auto" }}>
          <SettingsToggleRow icon={CheckSquare} label="Task Reminders" checked={p.taskReminders} onChange={(v) => setPref("taskReminders", v)} />
          <SettingsToggleRow icon={Moon} label="Prayer Reminders" checked={p.prayerReminders} onChange={(v) => setPref("prayerReminders", v)} />
          <SettingsToggleRow icon={Target} label="Goal Reminders" checked={p.goalReminders} onChange={(v) => setPref("goalReminders", v)} />
          <SettingsToggleRow icon={BookOpen} label="Study Reminders" checked={p.studyReminders} onChange={(v) => setPref("studyReminders", v)} />
          <SettingsToggleRow icon={Heart} label="Hobby Reminders" checked={p.hobbyReminders} onChange={(v) => setPref("hobbyReminders", v)} />
          <SettingsToggleRow icon={Feather} label="Habit Reminders" checked={p.habitReminders} onChange={(v) => setPref("habitReminders", v)} />
          <SettingsToggleRow icon={CalendarDays} label="Daily Summary" checked={p.dailySummary} onChange={(v) => setPref("dailySummary", v)} />
          <SettingsToggleRow icon={Flame} label="Streak Warning" checked={p.streakWarning} onChange={(v) => setPref("streakWarning", v)} />
          <SettingsSelectRow icon={Bell} label="Notification Sound" value={p.notificationSound} options={["Default", "Chime", "Adhan-style", "Silent"]} onChange={(v) => setPref("notificationSound", v)} />
          <SettingsToggleRow icon={Vibrate} label="Vibration" checked={p.vibration && s.haptics} onChange={(v) => { setPref("vibration", v); api.setAppSetting({ haptics: v }); }} />
        </div>
      </SettingsSection>

      <SettingsSection title="Tasks & Goals" icon={CheckSquare}>
        <SettingsSelectRow icon={Star} label="Default Task Priority" value={p.defaultTaskPriority} options={["Low", "Medium", "High"]} onChange={(v) => setPref("defaultTaskPriority", v)} />
        <SettingsSelectRow icon={Bell} label="Default Reminder Time" value={p.defaultReminderTime} options={["9:00 AM", "12:00 PM", "6:00 PM", "None"]} onChange={(v) => setPref("defaultReminderTime", v)} />
        <SettingsSelectRow icon={CalendarDays} label="Week Starts On" value={p.weekStartsOn} options={["Sunday", "Monday"]} onChange={(v) => setPref("weekStartsOn", v)} />
        <SettingsToggleRow icon={RotateCcw} label="Auto-complete Recurring Tasks" checked={p.autoCompleteRecurring} onChange={(v) => setPref("autoCompleteRecurring", v)} />
        <SettingsSelectRow icon={Target} label="Goal Progress Style" value={p.goalProgressStyle} options={["Bar", "Ring", "Percentage"]} onChange={(v) => setPref("goalProgressStyle", v)} />
        <SettingsSelectRow icon={Check} label="Completed Task Behaviour" value={p.completedTaskBehaviour} options={["Keep in list", "Move to Achieve", "Auto-delete after 30d"]} onChange={(v) => setPref("completedTaskBehaviour", v)} />
      </SettingsSection>

      <SettingsSection title="Namaz" icon={Moon}>
        <SettingsSelectRow icon={Moon} label="Prayer Calculation Method" value={p.prayerCalcMethod} options={["Muslim World League", "ISNA", "Egyptian", "Umm al-Qura", "Karachi"]} onChange={(v) => setPref("prayerCalcMethod", v)} />
        <SettingsSelectRow icon={Moon} label="Madhhab / Asr Method" value={p.madhhab} options={["Standard (Shafi'i)", "Hanafi"]} onChange={(v) => setPref("madhhab", v)} />
        <div style={{ padding: "11px 4px" }}>
          <div className="row-between" style={{ marginBottom: 8 }}>
            <span className="row g-2 t-sm bold"><CalendarDays size={16} className="t-faint" /> Location</span>
            <button className="t-xs bold" style={{ background: "none", border: "none", color: "var(--accent)" }} onClick={detectLocation} disabled={locSaving}>{locSaving ? "Locating…" : "Detect"}</button>
          </div>
          <div className="row g-2">
            <Input placeholder="e.g. Mumbai, India" value={locName} onChange={(e) => setLocName(e.target.value)} style={{ flex: 1 }} />
            <Btn variant="ghost" onClick={saveLocationName}>Save</Btn>
          </div>
          <div className="t-xs t-faint" style={{ marginTop: 4 }}>Auto-detect gives the closest known place name — edit it if it's not quite right.</div>
        </div>
        <SettingsToggleRow icon={Bell} label="Prayer Notifications" checked={p.prayerReminders} onChange={(v) => setPref("prayerReminders", v)} />
        <SettingsSelectRow icon={BellRing} label="Adhan Sound" value={p.adhanSound} options={["Silent", "Beep", "Adhan (short)", "Adhan (full)"]} onChange={(v) => setPref("adhanSound", v)} />
        <SettingsSelectRow icon={Bell} label="Pre-prayer Reminder" value={p.preprayerReminder} options={["Off", "5 min before", "10 min before", "15 min before"]} onChange={(v) => setPref("preprayerReminder", v)} />
        <SettingsActionRow icon={LayoutGrid} label="Qibla" sub="Coming soon" onClick={() => push("Qibla Finder is coming soon", "default")} />
      </SettingsSection>

      <SettingsSection title="Stats & Productivity" icon={BarChart3}>
        <SettingsToggleRow icon={BarChart3} label="Daily Productivity Score" checked={p.dailyProductivityScore} onChange={(v) => setPref("dailyProductivityScore", v)} />
        <SettingsToggleRow icon={CalendarDays} label="Weekly Summary" checked={p.weeklySummary} onChange={(v) => setPref("weeklySummary", v)} />
        <SettingsToggleRow icon={CalendarDays} label="Monthly Summary" checked={p.monthlySummary} onChange={(v) => setPref("monthlySummary", v)} />
        <SettingsToggleRow icon={Flame} label="Streak Tracking" checked={p.streakTracking} onChange={(v) => setPref("streakTracking", v)} />
        <SettingsToggleRow icon={Eye} label="Show Completed Tasks" checked={p.showCompletedTasks} onChange={(v) => setPref("showCompletedTasks", v)} />
        <SettingsActionRow icon={RotateCcw} label="Statistics Reset" sub="Clear productivity history" onClick={() => { if (confirm("Reset all statistics? This clears your activity log.")) { api.resetStatistics(); push("Statistics reset", "success"); } }} danger />
      </SettingsSection>

      <SettingsSection title="Data & Sync" icon={Cloud}>
        <SettingsToggleRow icon={Cloud} label="Cloud Sync" checked={p.cloudSync} onChange={(v) => setPref("cloudSync", v)} />
        <SettingsActionRow icon={Cloud} label="Backup" sub="Saves a .json file to Downloads/HayatOS" onClick={backupToDownloads} />
        <SettingsActionRow icon={RotateCcw} label="Restore" sub="Load from a backup file" onClick={() => importFileRef.current && importFileRef.current.click()} />
        <SettingsActionRow icon={Loader2} label="Sync Now" onClick={syncNow} />
        <input ref={importFileRef} type="file" accept="application/json" style={{ display: "none" }} onChange={onImportFile} />
      </SettingsSection>

      <SettingsSection title="General" icon={SettingsIcon}>
        <SettingsSelectRow icon={LayoutGrid} label="Language" value={p.language} options={["English"]} onChange={(v) => setPref("language", v)} />
        <SettingsSelectRow icon={CalendarDays} label="Date Format" value={p.dateFormat} options={["DD MMM YYYY", "MM/DD/YYYY", "DD/MM/YYYY"]} onChange={(v) => setPref("dateFormat", v)} />
        <SettingsSelectRow icon={TimerIcon} label="Time Format" value={p.timeFormat} options={["12h", "24h"]} onChange={(v) => setPref("timeFormat", v)} />
        <SettingsSelectRow icon={CalendarDays} label="First Day of Week" value={p.firstDayOfWeek} options={["Sunday", "Monday"]} onChange={(v) => setPref("firstDayOfWeek", v)} />
        <SettingsSelectRow icon={LayoutGrid} label="Time Zone" value={p.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone} options={TIMEZONE_LIST} onChange={(v) => setPref("timeZone", v)} />
        <SettingsSelectRow icon={LayoutGrid} label="Units" value={p.units} options={["Metric", "Imperial"]} onChange={(v) => setPref("units", v)} />
      </SettingsSection>

      <SettingsSection title="About" icon={Info}>
        <SettingsActionRow icon={Info} label="About HayatOS" onClick={() => soon("About")} />
        <SettingsActionRow icon={Sparkles} label="What's New" onClick={() => soon("What's new")} />
        <div className="row-between" style={{ padding: "11px 4px" }}><span className="t-sm bold">Version</span><span className="t-sm t-sub">1.0.0</span></div>
        <SettingsActionRow icon={ShieldCheck} label="Privacy Policy" onClick={() => soon("Privacy policy")} />
        <SettingsActionRow icon={ShieldCheck} label="Terms of Service" onClick={() => soon("Terms of service")} />
        <SettingsActionRow icon={Info} label="Help & Support" onClick={() => soon("Help & support")} />
        <SettingsActionRow icon={Heart} label="Send Feedback" onClick={() => soon("Feedback")} />
        <SettingsActionRow icon={Star} label="Rate HayatOS" onClick={() => soon("Rating")} />
      </SettingsSection>
    </div>
  );
}

/* ============================================================
   LOGIN SCREEN
   ============================================================ */
function LoginScreen({ onSignIn, onSignInEmail, onSignUpEmail, onResetPassword, onGuest, signingIn, error }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [localError, setLocalError] = useState("");
  // The <html> element's data-theme is already set correctly (light/dark, from system
  // preference or a cached choice) before this screen ever renders, so read it and pick a
  // matching background — that's what was showing a dark backdrop under a light theme.
  const [isLight, setIsLight] = useState(() => document.documentElement.getAttribute("data-theme") === "light");
  useEffect(() => {
    const obs = new MutationObserver(() => setIsLight(document.documentElement.getAttribute("data-theme") === "light"));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLocalError(""); setResetSent(false);
    if (!email.trim()) { setLocalError("Enter your email address."); return; }
    if (mode === "forgot") { const ok = await onResetPassword(email.trim()); if (ok) setResetSent(true); return; }
    if (!password) { setLocalError("Enter your password."); return; }
    if (mode === "signup" && password !== confirmPassword) { setLocalError("Passwords don't match."); return; }
    if (mode === "signup") onSignUpEmail(email.trim(), password); else onSignInEmail(email.trim(), password);
  };
  const shownError = localError || error;

  return (
    <div className="login-scope" data-theme={isLight ? "light" : "dark"} style={{ height: "100vh", overflowY: "auto", overflowX: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "40px 20px", boxSizing: "border-box" }}>
      <div className="hayat-bg" style={{ backgroundImage: `url(${isLight ? BG_LIGHT : BG_DARK})` }} />
      <div className="hayat-scrim" />
      <div className="liquid-glass col center g-4" style={{ width: "100%", maxWidth: 380, borderRadius: 32, padding: 30, color: "var(--text-1)", textAlign: "center" }}>
        <img src={LOGO_IMAGE} alt="HayatOS" style={{ width: 64, height: 64, borderRadius: 20, objectFit: "cover", boxShadow: "var(--shadow)" }} />
        <div>
          <div className="greeting-title" style={{ fontSize: 26 }}>HayatOS</div>
          <div className="t-sm t-sub" style={{ marginTop: 4 }}>Your personal operating system — synced across your devices.</div>
        </div>

        {mode === "forgot" ? (
          <form onSubmit={submit} className="col g-3" style={{ width: "100%" }}>
            <div className="t-sm t-sub" style={{ marginTop: -6 }}>Enter your email and we'll send you a reset link.</div>
            <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            {resetSent && <div className="t-xs" style={{ color: "var(--success)" }}>Reset link sent — check your inbox.</div>}
            <Btn block type="submit" disabled={signingIn}>{signingIn ? <Loader2 size={18} className="anim-spin" /> : "Send Reset Link"}</Btn>
            <button type="button" onClick={() => { setMode("signin"); setLocalError(""); setResetSent(false); }} className="t-xs t-sub" style={{ background: "none", border: "none", textDecoration: "underline" }}>Back to sign in</button>
          </form>
        ) : (
          <form onSubmit={submit} className="col g-3" style={{ width: "100%" }}>
            <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="pw-wrap">
              <Input type={showPw ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="pw-eye" onClick={() => setShowPw((s) => !s)}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            {mode === "signup" && (
              <div className="pw-wrap">
                <Input type={showPw2 ? "text" : "password"} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <button type="button" className="pw-eye" onClick={() => setShowPw2((s) => !s)}>{showPw2 ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            )}
            {mode === "signin" && <button type="button" onClick={() => { setMode("forgot"); setLocalError(""); }} className="t-xs t-sub" style={{ alignSelf: "flex-end", background: "none", border: "none", textDecoration: "underline", marginTop: -6 }}>Forgot password?</button>}
            <Btn block type="submit" disabled={signingIn}>{signingIn ? <Loader2 size={18} className="anim-spin" /> : mode === "signup" ? "Create Account" : "Sign In"}</Btn>
            <button type="button" onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setLocalError(""); }} className="t-xs t-sub" style={{ background: "none", border: "none" }}>
              {mode === "signup" ? "Already have an account? " : "Don't have an account? "}<span style={{ textDecoration: "underline", fontWeight: 700 }}>{mode === "signup" ? "Sign in" : "Sign up"}</span>
            </button>
          </form>
        )}

        <div className="row g-2" style={{ width: "100%", color: "var(--text-3)", fontSize: 11 }}>
          <div style={{ flex: 1, height: 1, background: "var(--divider)" }} /><span>OR</span><div style={{ flex: 1, height: 1, background: "var(--divider)" }} />
        </div>

        <button onClick={onSignIn} disabled={signingIn} className="liquid-sheen btn-block" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 16, padding: "13px 18px", fontWeight: 700, fontSize: 14, background: "#fff", color: "#1F2937", border: "none" }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.9 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.9 5.1 29.7 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.9 6.1 29.7 4 24 4c-7.8 0-14.5 4.4-17.7 10.7z" />
            <path fill="#4CAF50" d="M24 44c5.6 0 10.6-2.1 14.4-5.6l-6.7-5.5C29.6 34.7 27 35.5 24 35.5c-5.3 0-9.9-3.1-11.3-7.6l-6.6 5c3.1 6.4 9.9 11.1 17.9 11.1z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 3-3 5.4-5.6 6.9l6.7 5.5C39.9 37.9 44 32 44 24c0-1.4-.1-2.7-.4-3.5z" />
          </svg>
          Continue with Google
        </button>
        <Btn variant="ghost" block glass onClick={onGuest} disabled={signingIn}>Continue as Guest</Btn>

        {shownError && <div className="t-xs" style={{ color: "var(--danger)" }}>{shownError}</div>}
        <div className="t-xs" style={{ color: "var(--text-3)", lineHeight: 1.5 }}>Your tasks, goals, and habits sync to your account. Guest data stays on this device only.</div>
      </div>
    </div>
  );
}
/* ============================================================
   ROOT APP
   ============================================================ */
const THEME_BG = { light: BG_LIGHT, dark: BG_DARK, walnut: BG_WALNUT, crimson: BG_CRIMSON, azure: BG_AZURE, jade: BG_JADE, ...BG_GALLERY };

export default function App() {
  useEffect(() => {
    const setVh = () => document.documentElement.style.setProperty("--app-vh", `${window.innerHeight}px`);
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    return () => { window.removeEventListener("resize", setVh); window.removeEventListener("orientationchange", setVh); };
  }, []);
  // Global haptic feedback: rather than hand-wiring hapticTap() onto ~200 individual
  // onClick handlers (and inevitably missing new buttons added later), fire a light tap
  // on press-down for anything that looks tappable. Buttons that already call
  // hapticSuccess()/hapticWarn() in their own handler still get that too — an immediate
  // "you pressed something" tap plus a distinct outcome pulse is normal, expected feel.
  useEffect(() => {
    const TAPPABLE = 'button, a.nav-item, [role="button"], .theme-gallery-tile, .chip-scroll, .icon-btn, input[type="checkbox"], input[type="radio"], .tabbar-item, .prayer-row, .habit-check';
    const onPress = (e) => {
      const el = e.target.closest(TAPPABLE);
      if (!el || el.disabled || el.getAttribute("aria-disabled") === "true") return;
      hapticTap();
    };
    document.addEventListener("pointerdown", onPress, { capture: true, passive: true });
    return () => document.removeEventListener("pointerdown", onPress, { capture: true });
  }, []);
  const [state, setState] = useState(defaultState());
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState("dashboard");
  const [prefillAdd, setPrefillAdd] = useState(false);
  const [navParam, setNavParam] = useState(null);
  useEffect(() => {
    if (!loaded) return;
    setState((s) => {
      const now = Date.now();
      const kept = s.tasks.filter((t) => {
        if (!t.completed) return true; // missed/undone tasks never auto-delete
        const archivedAt = taskArchivedAt(t);
        if (archivedAt === null) return true;
        return (now - archivedAt) < 30 * DAY_MS;
      });
      return kept.length === s.tasks.length ? s : { ...s, tasks: kept };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [timer, setTimer] = useState(() => {
    try { const raw = localStorage.getItem("hayatos-study-timer"); if (raw) return { running: false, startedAt: null, accumulated: 0, subjectId: "", ...JSON.parse(raw) }; } catch (e) {}
    return { running: false, startedAt: null, accumulated: 0, subjectId: "" };
  });
  useEffect(() => { try { localStorage.setItem("hayatos-study-timer", JSON.stringify(timer)); } catch (e) {} }, [timer]);

  const saveTimer = useRef(null);
  const { push, Host } = useToast();

  const [authState, setAuthState] = useState({ status: "checking", user: null, error: null });
  const [signingIn, setSigningIn] = useState(false);
  const [syncStatus, setSyncStatus] = useState("offline");
  const applyingRemote = useRef(false);
  const listenerIdRef = useRef(null);

  const themeMode = state.theme === "auto" ? "auto" : state.theme;
  const resolvedTheme = useAppliedTheme(["light", "dark"].includes(themeMode) ? themeMode : themeMode === "auto" ? "auto" : themeMode);
  // Named non-light/dark themes are applied directly (not affected by system pref)
  useEffect(() => {
    if (!["auto", "light", "dark"].includes(state.theme)) {
      document.documentElement.setAttribute("data-theme", state.theme);
    }
  }, [state.theme]);
  useEffect(() => {
    const root = document.documentElement.style;
    if (state.theme !== "custom") {
      ["--accent","--accent-2","--bg-scrim-1","--bg-scrim-2","--text-1","--text-2","--text-3","--card","--card-strong","--card-border","--divider","--progress-grad","--shadow"].forEach((v) => root.removeProperty(v));
      return;
    }
    const ct = state.customTheme || {};
    const base = ct.mode === "image" && ct.accent ? ct.accent : (ct.color || "#3A2A1A");
    const dark = isDarkColor(base);
    const accent = ct.accent || base;
    root.setProperty("--accent", accent);
    root.setProperty("--accent-2", shade(accent, dark ? -30 : -40));
    root.setProperty("--bg-scrim-1", dark ? `rgba(${hexToRgb(base).r},${hexToRgb(base).g},${hexToRgb(base).b},.45)` : `rgba(${hexToRgb(base).r},${hexToRgb(base).g},${hexToRgb(base).b},.55)`);
    root.setProperty("--bg-scrim-2", dark ? `rgba(${hexToRgb(shade(base,-20)).r},${hexToRgb(shade(base,-20)).g},${hexToRgb(shade(base,-20)).b},.68)` : `rgba(${hexToRgb(shade(base,20)).r},${hexToRgb(shade(base,20)).g},${hexToRgb(shade(base,20)).b},.72)`);
    root.setProperty("--text-1", dark ? "#F2ECE4" : "#241C14");
    root.setProperty("--text-2", dark ? "#B8AA9C" : "#5A4C3E");
    root.setProperty("--text-3", dark ? "#8A7C6E" : "#8A7C6E");
    root.setProperty("--card", dark ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.55)");
    root.setProperty("--card-strong", dark ? "rgba(255,255,255,.13)" : "rgba(255,255,255,.78)");
    root.setProperty("--card-border", dark ? "rgba(255,255,255,.14)" : "rgba(30,20,10,.16)");
    root.setProperty("--divider", dark ? "rgba(255,255,255,.10)" : "rgba(30,20,10,.10)");
    root.setProperty("--progress-grad", `linear-gradient(90deg, ${shade(accent, 20)}, ${accent})`);
    root.setProperty("--shadow", "0 10px 30px rgba(0,0,0,.35)");
  }, [state.theme, state.customTheme]);
  const effectiveTheme = ["auto", "light", "dark"].includes(state.theme) ? resolvedTheme : state.theme;
  const bgImage = effectiveTheme === "custom"
    ? (state.customTheme && state.customTheme.mode === "image" ? state.customTheme.imageDataUrl : "")
    : (THEME_BG[effectiveTheme] || BG_DARK);

  useEffect(() => {
    if (!isNative()) return;
    const isDarkish = effectiveTheme !== "light";
    StatusBar.setBackgroundColor({ color: isDarkish ? "#1a0f0a" : "#F5EBDD" }).catch(() => {});
    StatusBar.setStyle({ style: isDarkish ? Style.Dark : Style.Light }).catch(() => {});
  }, [effectiveTheme]);

  useEffect(() => {
    let removed = false, listenerHandle = null;
    (async () => {
      try { const { user: current } = await FirebaseAuthentication.getCurrentUser(); if (!removed) setAuthState({ status: "ready", user: current || null, error: null }); }
      catch (e) { if (!removed) setAuthState({ status: "ready", user: null, error: null }); }
      try { listenerHandle = await FirebaseAuthentication.addListener("authStateChange", (change) => setAuthState({ status: "ready", user: change.user || null, error: null })); }
      catch (e) {}
    })();
    return () => { removed = true; if (listenerHandle) listenerHandle.remove(); };
  }, []);

  const signIn = async () => {
    setSigningIn(true); setAuthState((a) => ({ ...a, error: null }));
    try { await FirebaseAuthentication.signInWithGoogle(); }
    catch (e) { console.error(e); setAuthState((a) => ({ ...a, error: "Sign-in failed. Please try again." })); }
    finally { setSigningIn(false); }
  };
  const friendlyAuthError = friendlyAuthErrorStandalone;

  const signInEmail = async (email, password) => {
    setSigningIn(true); setAuthState((a) => ({ ...a, error: null }));
    try { await FirebaseAuthentication.signInWithEmailAndPassword({ email, password }); }
    catch (e) { setAuthState((a) => ({ ...a, error: friendlyAuthError(e) })); }
    finally { setSigningIn(false); }
  };
  const signUpEmail = async (email, password) => {
    setSigningIn(true); setAuthState((a) => ({ ...a, error: null }));
    try {
      await FirebaseAuthentication.createUserWithEmailAndPassword({ email, password });
      FirebaseAuthentication.sendEmailVerification().catch(() => {});
    }
    catch (e) { setAuthState((a) => ({ ...a, error: friendlyAuthError(e) })); }
    finally { setSigningIn(false); }
  };
  const resetPassword = async (email) => {
    try { await FirebaseAuthentication.sendPasswordResetEmail({ email }); return true; }
    catch (e) { setAuthState((a) => ({ ...a, error: friendlyAuthError(e) })); return false; }
  };
  const continueAsGuest = async () => {
    setSigningIn(true); setAuthState((a) => ({ ...a, error: null }));
    try { await FirebaseAuthentication.signInAnonymously(); }
    catch (e) { setAuthState((a) => ({ ...a, error: "Couldn't continue as guest. Please try again." })); }
    finally { setSigningIn(false); }
  };
  const signOutUser = async () => {
    try { if (listenerIdRef.current) { await FirebaseFirestore.removeSnapshotListener({ callbackId: listenerIdRef.current }); listenerIdRef.current = null; } } catch (e) {}
    try { await FirebaseAuthentication.signOut(); } catch (e) {}
    setState(defaultState()); setLoaded(false);
  };
  const user = authState.user;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try { const cached = await window.storage.get(STORAGE_KEY, false); if (cached && cached.value && !cancelled) setState({ ...defaultState(), ...JSON.parse(cached.value) }); } catch (e) {}
      const reference = `users/${user.uid}/appstate/main`;
      try {
        const { callbackId } = await FirebaseFirestore.addDocumentSnapshotListener({ reference }, (event, error) => {
          if (cancelled) return;
          if (error) { setSyncStatus("offline"); setLoaded(true); return; }
          const remote = event && event.snapshot && event.snapshot.data && event.snapshot.data.data;
          if (remote) {
            applyingRemote.current = true;
            const parsed = JSON.parse(remote);
            setState({ ...defaultState(), ...parsed, profile: { ...defaultState().profile, name: user.displayName || "", photoURL: user.photoUrl || "", ...parsed.profile } });
          } else {
            const seeded = { ...defaultState(), profile: { name: user.displayName || "", username: user.email ? user.email.split("@")[0] : "", photoURL: user.photoUrl || "" } };
            applyingRemote.current = true; setState(seeded);
            FirebaseFirestore.setDocument({ reference, data: { data: JSON.stringify(seeded), updatedAt: Date.now() }, merge: true }).catch(() => {});
          }
          setSyncStatus("synced"); setLoaded(true);
        });
        listenerIdRef.current = callbackId;
      } catch (e) { setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!loaded || !user) return;
    if (applyingRemote.current) { applyingRemote.current = false; return; }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSyncStatus("syncing");
    saveTimer.current = setTimeout(async () => {
      const payload = JSON.stringify(state);
      window.storage.set(STORAGE_KEY, payload, false).catch(() => {});
      try { await FirebaseFirestore.setDocument({ reference: `users/${user.uid}/appstate/main`, data: { data: payload, updatedAt: Date.now() }, merge: true }); setSyncStatus("synced"); }
      catch (e) { setSyncStatus("offline"); }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [state, loaded, user]);

  // If we went offline mid-edit, the debounced save above fails silently and
  // syncStatus sticks at "offline". As soon as the device reconnects, push
  // whatever is currently in memory straight away — no waiting for the next edit.
  useEffect(() => {
    if (!user) return;
    const resync = async () => {
      if (!navigator.onLine) return;
      setSyncStatus("syncing");
      try {
        const payload = JSON.stringify(state);
        await FirebaseFirestore.setDocument({ reference: `users/${user.uid}/appstate/main`, data: { data: payload, updatedAt: Date.now() }, merge: true });
        window.storage.set(STORAGE_KEY, payload, false).catch(() => {});
        setSyncStatus("synced");
      } catch (e) { setSyncStatus("offline"); }
    };
    window.addEventListener("online", resync);
    return () => window.removeEventListener("online", resync);
  }, [user, state]);

  // Ask for notification permission once signed in, then (re)schedule daily prayer-time alerts.
  useEffect(() => { syncRuntimePrefs(state.prefs, state.appSettings); }, [state.prefs, state.appSettings]);
  useEffect(() => {
    if (!loaded || !user) return;
    ensureNotifPermission();
    const ids = { fajr: 1, dhuhr: 2, asr: 3, maghrib: 4, isha: 5 };
    PRAYERS.forEach((p) => {
      const [h, m] = (state.namazTimes[p] || "00:00").split(":").map(Number);
      scheduleDailyNotification(ids[p], `${PRAYER_LABEL[p]} time`, "Time for prayer — tap to mark it in HayatOS.", h, m, "prayerReminders");
    });
  }, [loaded, user, state.namazTimes, state.prefs?.prayerReminders, state.appSettings?.notifications]);

  // Task due-date reminders — one real notification per upcoming task, at the user's default reminder time.
  useEffect(() => {
    if (!loaded || !user) return;
    for (let i = 0; i < 150; i++) cancelNotification(3000 + i);
    if (!notificationAllowed("taskReminders")) return;
    const timeParts = parseTimeLabel(state.prefs.defaultReminderTime);
    if (!timeParts) return;
    const [rh, rm] = timeParts;
    const upcoming = state.tasks.filter((t) => !t.completed && t.dueDate && t.dueDate >= todayKey()).sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1)).slice(0, 150);
    upcoming.forEach((t, i) => {
      const when = dateAt(t.dueDate, rh, rm);
      scheduleAtNotification(3000 + i, `Task due: ${t.title}`, t.category ? `${t.category} · ${t.priority || "Medium"} priority` : "Tap to open HayatOS", when, "taskReminders");
    });
  }, [loaded, user, state.tasks, state.prefs?.taskReminders, state.prefs?.defaultReminderTime, state.appSettings?.notifications]);

  // Task nudges — every ~2 hours through the day while any task is still pending today or overdue.
  useEffect(() => {
    if (!loaded || !user) return;
    REMINDER_SLOTS.forEach((h, i) => cancelNotification(3160 + i));
    if (!notificationAllowed("taskReminders")) return;
    const pending = state.tasks.filter((t) => !t.completed && t.dueDate && t.dueDate <= todayKey());
    if (!pending.length) return;
    const body = pending.length === 1 ? `"${pending[0].title}" is still pending.` : `${pending.length} tasks are still pending — tap to finish them.`;
    REMINDER_SLOTS.forEach((h, i) => scheduleAtNotification(3160 + i, "Pending tasks reminder", body, dateAt(todayKey(), h, 0), "taskReminders"));
  }, [loaded, user, state.tasks, state.prefs?.taskReminders, state.appSettings?.notifications]);

  // Goal deadline reminders — a 3-day-out nudge plus a due-day alert per active goal.
  useEffect(() => {
    if (!loaded || !user) return;
    for (let i = 0; i < 100; i++) cancelNotification(3200 + i);
    if (!notificationAllowed("goalReminders")) return;
    const timeParts = parseTimeLabel(state.prefs.defaultReminderTime);
    if (!timeParts) return;
    const [rh, rm] = timeParts;
    const active = state.goals.filter((g) => g.status !== "archived" && (g.progress || 0) < 100 && g.deadline).slice(0, 50);
    active.forEach((g, i) => {
      scheduleAtNotification(3200 + i * 2, `Goal due today: ${g.title}`, `You're at ${g.progress || 0}% — final push!`, dateAt(g.deadline, rh, rm), "goalReminders");
      scheduleAtNotification(3200 + i * 2 + 1, `3 days left: ${g.title}`, `Deadline is ${prettyDate(g.deadline)} — currently ${g.progress || 0}%`, dateAt(addDays(g.deadline, -3), rh, rm), "goalReminders");
    });
  }, [loaded, user, state.goals, state.prefs?.goalReminders, state.prefs?.defaultReminderTime, state.appSettings?.notifications]);

  // Goal nudges — every ~2 hours through the day while any active goal is behind pace.
  useEffect(() => {
    if (!loaded || !user) return;
    REMINDER_SLOTS.forEach((h, i) => cancelNotification(3310 + i));
    if (!notificationAllowed("goalReminders")) return;
    const behind = state.goals.filter((g) => g.status !== "archived" && (g.progress || 0) < 100 && goalPaceStatus(g) === "atRisk");
    if (!behind.length) return;
    const body = behind.length === 1 ? `"${behind[0].title}" is at risk — give it some time today.` : `${behind.length} goals are at risk — give them some time today.`;
    REMINDER_SLOTS.forEach((h, i) => scheduleAtNotification(3310 + i, "Goals need attention", body, dateAt(todayKey(), h, 0), "goalReminders"));
  }, [loaded, user, state.goals, state.prefs?.goalReminders, state.appSettings?.notifications]);

  // Study — evening nudge if today's study goal isn't met yet (recomputed whenever the app is open).
  useEffect(() => {
    if (!loaded || !user) return;
    const id = 3400;
    if (!notificationAllowed("studyReminders")) { cancelNotification(id); return; }
    const todayMin = state.study.sessions.filter((s) => s.date === todayKey()).reduce((a, s) => a + s.minutes, 0);
    if (todayMin >= state.study.dailyGoalMinutes) { cancelNotification(id); return; }
    scheduleAtNotification(id, "Study goal not met yet", `${fmtHM(state.study.dailyGoalMinutes - todayMin)} left for today's goal.`, dateAt(todayKey(), 19, 30), "studyReminders");
  }, [loaded, user, state.study.sessions, state.study.dailyGoalMinutes, state.prefs?.studyReminders, state.appSettings?.notifications]);

  // Hobby — every ~2 hours through the day while a hobby with an active streak hasn't been logged today.
  useEffect(() => {
    if (!loaded || !user) return;
    cancelNotification(3500);
    REMINDER_SLOTS.forEach((h, i) => cancelNotification(3520 + i));
    if (!notificationAllowed("hobbyReminders")) return;
    const key = todayKey();
    const atRisk = (state.hobbies || []).filter((h) => {
      const days = new Set((h.sessions || []).map((s) => s.date));
      const streak = computeStreak((k) => days.has(k));
      return streak > 0 && !days.has(key);
    });
    if (!atRisk.length) return;
    const names = atRisk.slice(0, 3).map((h) => h.name).join(", ");
    REMINDER_SLOTS.forEach((h, i) => scheduleAtNotification(3520 + i, "Keep your streak alive", `${names} — no session logged today yet.`, dateAt(key, h, 0), "hobbyReminders"));
  }, [loaded, user, state.hobbies, state.prefs?.hobbyReminders, state.appSettings?.notifications]);

  // Habits — evening nudge if any habit is still unchecked today.
  useEffect(() => {
    if (!loaded || !user) return;
    const id = 3600;
    if (!notificationAllowed("habitReminders") || !state.habits.length) { cancelNotification(id); return; }
    const key = todayKey();
    const pending = state.habits.filter((h) => !h.doneDates[key]);
    if (!pending.length) { cancelNotification(id); return; }
    scheduleAtNotification(id, "Habits waiting for you", `${pending.length} habit${pending.length > 1 ? "s" : ""} left to check off today.`, dateAt(key, 20, 30), "habitReminders");
  }, [loaded, user, state.habits, state.prefs?.habitReminders, state.appSettings?.notifications]);

  // Daily Summary — a repeating morning digest.
  useEffect(() => {
    if (!loaded || !user) return;
    const id = 3700;
    if (!notificationAllowed("dailySummary")) { cancelNotification(id); return; }
    scheduleDailyNotification(id, "Your day at a glance", "Open HayatOS to see today's tasks, prayers, and goals.", 7, 30, "dailySummary");
  }, [loaded, user, state.prefs?.dailySummary, state.appSettings?.notifications]);

  // Streak Warning — evening ping if today's Namaz streak is still incomplete (only while Namaz tracking is active).
  useEffect(() => {
    if (!loaded || !user) return;
    const id = 3800;
    if (!notificationAllowed("streakWarning") || state.trackingPaused) { cancelNotification(id); return; }
    const key = todayKey();
    const today = state.namaz[key] || {};
    const doneToday = PRAYERS.filter((p) => today[p]).length;
    if (doneToday >= 5) { cancelNotification(id); return; }
    scheduleAtNotification(id, "Don't break your streak", `${5 - doneToday} prayer${5 - doneToday > 1 ? "s" : ""} left to mark today.`, dateAt(key, 21, 0), "streakWarning");
  }, [loaded, user, state.namaz, state.trackingPaused, state.prefs?.streakWarning, state.appSettings?.notifications]);

  const logActivity = (text, kind = "info", xp = 0) => {
    setState((s) => ({ ...s, activity: [{ id: uid(), ts: Date.now(), text, kind, xp }, ...s.activity].slice(0, 40) }));
    if (xp) addXP(xp);
  };
  const addXP = (amount) => setState((s) => ({ ...s, profile: { ...s.profile, xp: (s.profile.xp || 0) + amount } }));

  const api = useMemo(() => ({
    addTask: (task) => { const tk = { id: uid(), completed: false, tags: [], favorite: false, ...task, createdAt: Date.now() }; setState((s) => ({ ...s, tasks: [tk, ...s.tasks] })); logActivity(`Added task "${tk.title}"`); hapticTap(); },
    updateTask: (id, patch) => setState((s) => ({ ...s, tasks: s.tasks.map((x) => x.id === id ? { ...x, ...patch } : x) })),
    deleteTask: (id) => setState((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) })),
    toggleTaskFavorite: (id) => setState((s) => ({ ...s, tasks: s.tasks.map((x) => x.id === id ? { ...x, favorite: !x.favorite } : x) })),
    toggleTask: (id) => setState((s) => { const tk = s.tasks.find((x) => x.id === id); const completed = !tk.completed; logActivity(completed ? `Completed "${tk.title}"` : `Reopened "${tk.title}"`, completed ? "success" : "info", completed ? 10 : 0); if (completed) hapticSuccess(); else hapticTap(); return { ...s, tasks: s.tasks.map((x) => x.id === id ? { ...x, completed, progress: completed ? 100 : x.progress, completedAt: completed ? Date.now() : null } : x) }; }),
    reorderTasks: (orderedIds) => setState((s) => { const byId = Object.fromEntries(s.tasks.map((x) => [x.id, x])); const reordered = orderedIds.map((id) => byId[id]).filter(Boolean); const rest = s.tasks.filter((x) => !orderedIds.includes(x.id)); return { ...s, tasks: [...reordered, ...rest] }; }),

    addGoal: (goal) => { const g = { id: uid(), milestones: [], status: "active", target: "", ...goal, createdAt: Date.now() }; setState((s) => ({ ...s, goals: [g, ...s.goals] })); logActivity(`New goal "${g.title}"`); hapticTap(); },
    updateGoal: (id, patch) => setState((s) => {
      const before = s.goals.find((g) => g.id === id);
      if (patch.progress != null && before && before.progress < 100 && patch.progress >= 100) { logActivity(`Completed goal "${before.title}"`, "success", 50); hapticSuccess(); }
      return { ...s, goals: s.goals.map((g) => g.id === id ? { ...g, ...patch } : g) };
    }),
    setGoalStatus: (id, status) => setState((s) => ({ ...s, goals: s.goals.map((g) => g.id === id ? { ...g, status } : g) })),
    deleteGoal: (id) => setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) })),
    reorderGoals: (orderedIds) => setState((s) => { const byId = Object.fromEntries(s.goals.map((x) => [x.id, x])); const reordered = orderedIds.map((id) => byId[id]).filter(Boolean); const rest = s.goals.filter((x) => !orderedIds.includes(x.id)); return { ...s, goals: [...reordered, ...rest] }; }),

    toggleNamaz: (key, prayer) => setState((s) => {
      if (s.trackingPaused) return s;
      const day = s.namaz[key] || { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
      const willBeDone = !day[prayer];
      if (willBeDone) {
        logActivity(`${PRAYER_LABEL[prayer]} prayer marked`, "success", 10);
        if (PRAYERS.filter((p) => p === prayer || day[p]).length === 5) { logActivity("All 5 prayers marked today", "success", 25); hapticSuccess(); }
      }
      return { ...s, namaz: { ...s.namaz, [key]: { ...day, [prayer]: willBeDone } } };
    }),
    setNamazTimes: (times) => setState((s) => ({ ...s, namazTimes: times })),
    setTrackingPaused: (v) => setState((s) => ({ ...s, trackingPaused: v })),
    incTasbih: () => setState((s) => { const c = (s.tasbih?.count || 0) + 1; if (c % (s.tasbih?.target || 33) === 0) hapticSuccess(); else hapticTap(); return { ...s, tasbih: { ...s.tasbih, count: c } }; }),
    resetTasbih: () => setState((s) => ({ ...s, tasbih: { ...s.tasbih, count: 0 } })),
    setTasbihTarget: (target) => setState((s) => ({ ...s, tasbih: { ...s.tasbih, target } })),

    addSubject: (nameOrObj) => setState((s) => { const patch = typeof nameOrObj === "string" ? { name: nameOrObj } : nameOrObj; return { ...s, study: { ...s.study, subjects: [...s.study.subjects, { id: uid(), name: "", chapters: [], resources: [], sketches: [], notes: "", ...patch }] } }; }),
    removeSubject: (id) => setState((s) => ({ ...s, study: { ...s.study, subjects: s.study.subjects.filter((x) => x.id !== id) } })),
    reorderSubjects: (newSubjectsArray) => setState((s) => ({ ...s, study: { ...s.study, subjects: newSubjectsArray } })),
    updateSubject: (id, patch) => setState((s) => ({ ...s, study: { ...s.study, subjects: s.study.subjects.map((x) => x.id === id ? { ...x, ...patch } : x) } })),
    setSubjectNotes: (id, notes) => setState((s) => ({ ...s, study: { ...s.study, subjects: s.study.subjects.map((x) => x.id === id ? { ...x, notes } : x) } })),
    addChapter: (subjectId, title) => setState((s) => ({ ...s, study: { ...s.study, subjects: s.study.subjects.map((x) => x.id === subjectId ? { ...x, chapters: [...(x.chapters || []), { id: uid(), title, status: "notStarted", progress: 0, notes: "" }] } : x) } })),
    updateChapter: (subjectId, chapterId, patch) => setState((s) => ({ ...s, study: { ...s.study, subjects: s.study.subjects.map((x) => x.id === subjectId ? { ...x, chapters: (x.chapters || []).map((c) => c.id === chapterId ? { ...c, ...patch } : c) } : x) } })),
    deleteChapter: (subjectId, chapterId) => setState((s) => ({ ...s, study: { ...s.study, subjects: s.study.subjects.map((x) => x.id === subjectId ? { ...x, chapters: (x.chapters || []).filter((c) => c.id !== chapterId) } : x) } })),
    addSubjectResource: (subjectId, resource) => setState((s) => ({ ...s, study: { ...s.study, subjects: s.study.subjects.map((x) => x.id === subjectId ? { ...x, resources: [{ id: uid(), createdAt: Date.now(), ...resource }, ...(x.resources || [])] } : x) } })),
    deleteSubjectResource: (subjectId, resourceId) => setState((s) => ({ ...s, study: { ...s.study, subjects: s.study.subjects.map((x) => x.id === subjectId ? { ...x, resources: (x.resources || []).filter((r) => r.id !== resourceId) } : x) } })),
    addSketch: (subjectId, sketch) => setState((s) => ({ ...s, study: { ...s.study, subjects: s.study.subjects.map((x) => x.id === subjectId ? { ...x, sketches: [{ id: uid(), createdAt: Date.now(), ...sketch }, ...(x.sketches || [])] } : x) } })),
    deleteSketch: (subjectId, sketchId) => setState((s) => ({ ...s, study: { ...s.study, subjects: s.study.subjects.map((x) => x.id === subjectId ? { ...x, sketches: (x.sketches || []).filter((sk) => sk.id !== sketchId) } : x) } })),
    logStudyBreak: () => setState((s) => ({ ...s, study: { ...s.study, breaks: [{ id: uid(), date: todayKey(), createdAt: Date.now() }, ...(s.study.breaks || [])] } })),
    logStudySession: ({ subjectId, minutes, note, date }) => setState((s) => ({ ...s, study: { ...s.study, sessions: [{ id: uid(), subjectId, minutes, note: note || "", date, createdAt: Date.now() }, ...s.study.sessions] } })),
    setStudyGoal: (minutes) => setState((s) => ({ ...s, study: { ...s.study, dailyGoalMinutes: minutes } })),

    setPomodoroSettings: (patch) => setState((s) => ({ ...s, pomodoro: { ...s.pomodoro, ...patch } })),
    logPomodoro: (type, minutes) => { setState((s) => ({ ...s, pomodoro: { ...s.pomodoro, log: [{ id: uid(), date: todayKey(), type, minutes, createdAt: Date.now() }, ...s.pomodoro.log] } })); if (type === "focus") logActivity(`Finished a ${minutes}m focus session`, "success"); },

    addWater: (key, delta) => setState((s) => { const cur = s.water.days[key] || 0; return { ...s, water: { ...s.water, days: { ...s.water.days, [key]: Math.max(0, cur + delta) } } }; }),
    setWaterGoal: (goalGlasses) => setState((s) => ({ ...s, water: { ...s.water, goalGlasses } })),

    logSleep: ({ date, sleepTime, wakeTime, note }) => setState((s) => {
      const [sh, sm] = sleepTime.split(":").map(Number), [wh, wm] = wakeTime.split(":").map(Number);
      let durationMin = (wh * 60 + wm) - (sh * 60 + sm); if (durationMin <= 0) durationMin += 24 * 60;
      const entry = { id: uid(), date, sleepTime, wakeTime, durationMin, note: note || "", createdAt: Date.now() };
      return { ...s, sleep: { ...s.sleep, logs: [entry, ...s.sleep.logs.filter((l) => l.date !== date)] } };
    }),
    setSleepGoal: (hours) => setState((s) => ({ ...s, sleep: { ...s.sleep, goalHours: hours } })),

    addTransaction: (tx) => { const tr = { id: uid(), type: "expense", amount: 0, category: "General", note: "", date: todayKey(), createdAt: Date.now(), ...tx }; setState((s) => ({ ...s, money: { ...s.money, transactions: [tr, ...s.money.transactions] } })); },
    deleteTransaction: (id) => setState((s) => ({ ...s, money: { ...s.money, transactions: s.money.transactions.filter((x) => x.id !== id) } })),
    setSavingsGoal: (target, current) => setState((s) => ({ ...s, money: { ...s.money, savingsGoal: { target, current: current ?? s.money.savingsGoal.current } } })),

    addTradingLesson: (title) => setState((s) => ({ ...s, trading: { ...s.trading, lessons: [...s.trading.lessons, { id: uid(), title, done: false }] } })),
    toggleTradingLesson: (id) => setState((s) => ({ ...s, trading: { ...s.trading, lessons: s.trading.lessons.map((l) => l.id === id ? { ...l, done: !l.done } : l) } })),
    deleteTradingLesson: (id) => setState((s) => ({ ...s, trading: { ...s.trading, lessons: s.trading.lessons.filter((l) => l.id !== id) } })),
    addTradingNote: (text) => setState((s) => ({ ...s, trading: { ...s.trading, notes: [{ id: uid(), text, date: todayKey(), createdAt: Date.now() }, ...s.trading.notes] } })),
    deleteTradingNote: (id) => setState((s) => ({ ...s, trading: { ...s.trading, notes: s.trading.notes.filter((n) => n.id !== id) } })),
    addTradingSession: (session) => setState((s) => ({ ...s, trading: { ...s.trading, sessions: [{ id: uid(), date: todayKey(), createdAt: Date.now(), ...session }, ...s.trading.sessions] } })),

    addJournalEntry: (entry) => setState((s) => ({ ...s, journal: { ...s.journal, entries: [{ id: uid(), date: todayKey(), createdAt: Date.now(), ...entry }, ...s.journal.entries] } })),
    deleteJournalEntry: (id) => setState((s) => ({ ...s, journal: { ...s.journal, entries: s.journal.entries.filter((e) => e.id !== id) } })),

    addNote: (note) => setState((s) => ({ ...s, notes: { ...s.notes, items: [{ id: uid(), createdAt: Date.now(), updatedAt: Date.now(), pinned: false, ...note }, ...s.notes.items] } })),
    updateNote: (id, patch) => setState((s) => ({ ...s, notes: { ...s.notes, items: s.notes.items.map((n) => n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n) } })),
    deleteNote: (id) => setState((s) => ({ ...s, notes: { ...s.notes, items: s.notes.items.filter((n) => n.id !== id) } })),
    toggleNotePin: (id) => setState((s) => ({ ...s, notes: { ...s.notes, items: s.notes.items.map((n) => n.id === id ? { ...n, pinned: !n.pinned } : n) } })),

    addReminder: (r) => setState((s) => ({ ...s, reminders: [{ id: uid(), firedFor: {}, createdAt: Date.now(), ...r }, ...s.reminders] })),
    updateReminder: (id, patch) => setState((s) => ({ ...s, reminders: s.reminders.map((r) => r.id === id ? { ...r, ...patch } : r) })),
    deleteReminder: (id) => setState((s) => ({ ...s, reminders: s.reminders.filter((r) => r.id !== id) })),
    markReminderFired: (id, key) => setState((s) => ({ ...s, reminders: s.reminders.map((r) => r.id === id ? { ...r, firedFor: { ...r.firedFor, [key]: true } } : r) })),

    setTheme: (theme) => setState((s) => ({ ...s, theme })),
    updateProfile: (patch) => setState((s) => ({ ...s, profile: { ...s.profile, ...patch } })),
    addHobby: (hobby) => setState((s) => ({ ...s, hobbies: [{ id: uid(), name: "", category: "Creative", favorite: false, sessions: [], milestones: [], goal: null, minutesToday: 0, streak: 0, createdAt: Date.now(), ...hobby }, ...s.hobbies] })),
    deleteHobby: (id) => setState((s) => ({ ...s, hobbies: s.hobbies.filter((h) => h.id !== id) })),
    toggleHobbyDone: (id) => setState((s) => { const h = s.hobbies.find((x) => x.id === id); if (h && !h.done) addXP(5); return { ...s, hobbies: s.hobbies.map((x) => x.id === id ? { ...x, done: !x.done } : x) }; }),
    toggleHobbyFavorite: (id) => setState((s) => ({ ...s, hobbies: s.hobbies.map((h) => h.id === id ? { ...h, favorite: !h.favorite } : h) })),
    updateHobby: (id, patch) => setState((s) => ({ ...s, hobbies: s.hobbies.map((h) => h.id === id ? { ...h, ...patch } : h) })),
    logHobbySession: (id, { minutes, note, date }) => setState((s) => {
      logActivity(`Logged ${minutes}m for a hobby session`, "success", 8); addXP(8);
      return { ...s, hobbies: s.hobbies.map((h) => h.id === id ? { ...h, sessions: [{ id: uid(), minutes, note: note || "", date: date || todayKey(), createdAt: Date.now() }, ...(h.sessions || [])] } : h) };
    }),
    deleteHobbySession: (hobbyId, sessionId) => setState((s) => ({ ...s, hobbies: s.hobbies.map((h) => h.id === hobbyId ? { ...h, sessions: (h.sessions || []).filter((x) => x.id !== sessionId) } : h) })),
    addHobbyMilestone: (id, title) => setState((s) => ({ ...s, hobbies: s.hobbies.map((h) => h.id === id ? { ...h, milestones: [...(h.milestones || []), { id: uid(), title, done: false }] } : h) })),
    toggleHobbyMilestone: (hobbyId, milestoneId) => setState((s) => ({ ...s, hobbies: s.hobbies.map((h) => h.id === hobbyId ? { ...h, milestones: (h.milestones || []).map((m) => m.id === milestoneId ? { ...m, done: !m.done } : m) } : h) })),
    deleteHobbyMilestone: (hobbyId, milestoneId) => setState((s) => ({ ...s, hobbies: s.hobbies.map((h) => h.id === hobbyId ? { ...h, milestones: (h.milestones || []).filter((m) => m.id !== milestoneId) } : h) })),
    addHabit: (name) => setState((s) => ({ ...s, habits: [...s.habits, { id: uid(), name, doneDates: {}, createdAt: Date.now() }] })),
    deleteHabit: (id) => setState((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) })),
    toggleHabitToday: (id) => setState((s) => { const k = todayKey(); return { ...s, habits: s.habits.map((h) => h.id === id ? { ...h, doneDates: { ...h.doneDates, [k]: !h.doneDates[k] } } : h) }; }),
    logMood: (mood, note) => setState((s) => { const k = todayKey(); const rest = s.mood.logs.filter((l) => l.date !== k); return { ...s, mood: { logs: [{ id: uid(), date: k, mood, note: note || "", createdAt: Date.now() }, ...rest] } }; }),
    logHealth: (entry) => setState((s) => ({ ...s, health: { logs: [{ id: uid(), date: todayKey(), createdAt: Date.now(), ...entry }, ...s.health.logs] } })),
    deleteHealthLog: (id) => setState((s) => ({ ...s, health: { logs: s.health.logs.filter((l) => l.id !== id) } })),
    setAppSetting: (patch) => setState((s) => ({ ...s, appSettings: { ...s.appSettings, ...patch } })),
    setPref: (key, value) => setState((s) => ({ ...s, prefs: { ...s.prefs, [key]: value } })),
    importState: (data) => setState((s) => ({ ...defaultState(), ...s, ...data, profile: { ...s.profile, ...(data.profile || {}) } })),
    resetStatistics: () => setState((s) => ({ ...s, activity: [] })),
    addScheduleEvent: (ev) => setState((s) => ({ ...s, scheduleEvents: [{ id: uid(), title: "", time: "", notes: "", ...ev }, ...s.scheduleEvents] })),
    deleteScheduleEvent: (id) => setState((s) => ({ ...s, scheduleEvents: s.scheduleEvents.filter((e) => e.id !== id) })),
    setCustomTheme: (patch) => setState((s) => ({ ...s, customTheme: { ...s.customTheme, ...patch } })),
  }), []);

  const scrollTop = () => { window.scrollTo({ top: 0, behavior: "smooth" }); };
  const historyRef = useRef(["dashboard"]);
  const [navDir, setNavDir] = useState("fwd");
  const [lastNH, setLastNH] = useState(() => { try { return localStorage.getItem("hayat_last_nh") || "namaz"; } catch (e) { return "namaz"; } });
  // Namaz ↔ Hobby is a single switch: whichever side is active is the one being tracked.
  // Switching to Hobby auto-pauses Namaz recording (and excludes those days from streaks/Stats);
  // switching back to Namaz resumes it immediately — no manual pause button needed.
  useEffect(() => {
    if (!loaded) return;
    api.setTrackingPaused(lastNH === "hobby");
  }, [lastNH, loaded]);
  const onNav = (key, opts) => {
    const tabOrder = TABS.map((t) => t.key);
    const oldIdx = tabOrder.indexOf(active), newIdx = tabOrder.indexOf(key);
    setNavDir(oldIdx !== -1 && newIdx !== -1 ? (newIdx >= oldIdx ? "fwd" : "back") : "fwd");
    if (key !== historyRef.current[historyRef.current.length - 1]) historyRef.current.push(key);
    if (key === "namaz" || key === "hobby") { setLastNH(key); try { localStorage.setItem("hayat_last_nh", key); } catch (e) {} }
    setActive(key); setPrefillAdd(!!(opts && opts.addTask)); setNavParam(opts && opts.param !== undefined ? opts.param : null); scrollTop();
  };
  const goBack = () => {
    const h = historyRef.current;
    if (h.length > 1) { setNavDir("back"); h.pop(); const prev = h[h.length - 1]; setActive(prev); scrollTop(); return true; }
    return false;
  };
  const mainTabKeySet = new Set(TABS.map((t) => t.key));
  const isSubPage = !mainTabKeySet.has(active);

  useEffect(() => {
    let listenerHandle;
    CapApp.addListener("backButton", () => {
      const went = goBack();
      if (!went) {
        if (active !== "dashboard") { setActive("dashboard"); historyRef.current = ["dashboard"]; }
        else CapApp.exitApp();
      }
    }).then((h) => { listenerHandle = h; });
    return () => { if (listenerHandle) listenerHandle.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);


  const swipeStart = useRef({ x: 0, y: 0 });
  const mainTabKeys = TABS.map((t) => t.key); // primary swipeable order
  const onTouchStartPage = (e) => {
    const t = e.touches[0]; swipeStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEndPage = (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - swipeStart.current.x, dy = t.clientY - swipeStart.current.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.6) return; // mostly-horizontal, decisive swipe only
    const idx = mainTabKeys.indexOf(active);
    if (idx === -1) return; // not on a primary tab (e.g. inside profile/settings/hobby) — don't hijack
    if (dx < 0 && idx < mainTabKeys.length - 1) onNav(mainTabKeys[idx + 1]);
    else if (dx > 0 && idx > 0) onNav(mainTabKeys[idx - 1]);
  };


  if (authState.status === "checking") {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0203", color: "#F6ECE4", flexDirection: "column", gap: 12 }}>
      <img src={LOGO_IMAGE} alt="HayatOS" style={{ width: 48, height: 48, borderRadius: 18, animation: "pulse 1.6s ease-in-out infinite" }} /><div className="bold">Loading HayatOS…</div>
    </div>;
  }
  if (!user) return <LoginScreen onSignIn={signIn} onSignInEmail={signInEmail} onSignUpEmail={signUpEmail} onResetPassword={resetPassword} onGuest={continueAsGuest} signingIn={signingIn} error={authState.error} />;
  if (!loaded) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0203", color: "#F6ECE4", flexDirection: "column", gap: 12 }}>
      <img src={LOGO_IMAGE} alt="HayatOS" style={{ width: 48, height: 48, borderRadius: 18, animation: "pulse 1.6s ease-in-out infinite" }} /><div className="bold">Loading your data…</div>
    </div>;
  }
  const pages = {
    dashboard: <Dashboard state={state} api={api} onNav={onNav} push={push} lastNH={lastNH} />,
    tasks: <Tasks state={state} api={api} push={push} prefill={prefillAdd} onNav={onNav} />,
    achieve: <Achieve state={state} api={api} push={push} />,
    goals: <Goals state={state} api={api} push={push} />,
    namaz: <Namaz state={state} api={api} push={push} onNav={onNav} />,
    qibla: <QiblaView onBack={() => onNav("namaz")} />,
    tasbih: <TasbihView state={state} api={api} />,
    duas: <DuaListView />,
    surahs: <SurahListView onNav={onNav} />,
    surahDetail: <SurahDetailView onNav={onNav} surahNumber={navParam} />,
    hobby: <Hobby state={state} api={api} push={push} onNav={onNav} />,
    hobbyDetail: <HobbyDetailView state={state} api={api} push={push} onNav={onNav} hobbyId={navParam} />,
    study: <Study state={state} api={api} push={push} timer={timer} setTimer={setTimer} onNav={onNav} />,
    subjectDetail: <SubjectDetailView state={state} api={api} push={push} onNav={onNav} subjectId={navParam} />,
    pomodoro: <Pomodoro state={state} api={api} />,
    water: <Water state={state} api={api} push={push} />,
    sleep: <Sleep state={state} api={api} push={push} />,
    money: <Money state={state} api={api} push={push} />,
    trading: <Trading state={state} api={api} push={push} />,
    journal: <Journal state={state} api={api} push={push} />,
    notes: <Notes state={state} api={api} push={push} />,
    calendar: <Calendar state={state} api={api} push={push} />,
    reminders: <Reminders state={state} api={api} push={push} />,
    statistics: <Statistics state={state} lastNH={lastNH} />,
    profile: <Profile state={state} api={api} push={push} user={user} onSignOut={signOutUser} syncStatus={syncStatus} onNav={onNav} lastNH={lastNH} />,
    settings: <Settings state={state} api={api} push={push} onNav={onNav} user={user} onSignOut={signOutUser} />,
    more: <MoreHub onNav={onNav} push={push} lastNH={lastNH} />,
    habits: <HabitsView state={state} api={api} push={push} />,
    mood: <MoodView state={state} api={api} push={push} />,
    health: <HealthView state={state} api={api} push={push} />,
  };

  return (
    <div className="shell">
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.92)}}`}</style>
      <div className="hayat-bg" style={{ backgroundImage: `url(${bgImage})` }} />
      <div className="hayat-scrim" />
      <Sidebar active={active} onNav={onNav} />
      <div className="shell-main">
        <div className="page" onTouchStart={onTouchStartPage} onTouchEnd={onTouchEndPage}>
          <div className="hayat-header">
            <div />
            <div className="row g-2">
              <button className="icon-btn" onClick={() => api.setTheme(effectiveTheme === "dark" ? "light" : "dark")}>
                {effectiveTheme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <button className="avatar-btn" onClick={() => onNav("profile")}>{state.profile.photoURL ? <img src={state.profile.photoURL} alt="" /> : (state.profile.name || user.email || "?").slice(0, 1).toUpperCase()}</button>
            </div>
          </div>
          <div key={active} className={navDir === "back" ? "anim-slideBack" : "anim-slideFwd"}>
            {pages[active] || pages.dashboard}
          </div>
        </div>
        <TabBar active={active} onNav={onNav} lastNH={lastNH} />
      </div>
      {isSubPage && <FloatingBackButton onBack={goBack} />}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} active={active} onNav={onNav} />
      <Host />
    </div>
  );
}

const rootEl = document.getElementById("root");
createRoot(rootEl).render(<App />);
