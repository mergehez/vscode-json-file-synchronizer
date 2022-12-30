import { reactive, ref } from "vue";

const vscode = Function(` return typeof acquireVsCodeApi == 'function' ? acquireVsCodeApi() : undefined; `)();
console.log("vscode: ", vscode);

export const loader = reactive({ active: false, target: ''});

export function postMessage(data: any, loaderTarget: string){
    if(!loaderTarget) {
        vscode?.postMessage(data);
        return;
    }

    loader.active = true;
    loader.target = loaderTarget;
    setTimeout(() => {
        vscode?.postMessage(data);
    }, 1000);
}

export const message = ref({ type: 'success', text: '', class: '' });
function setMessage(text: string, type = 'danger', duration = 10000){
    message.value = {type, text, class: `px-2 text-lg alert alert-${type}`};
    if(text.length > 0){
        // setTimeout(() => {
        //     message.value = { type: 'success', text: '', class: '' };
        // }, duration);
    }
}
export function updateCurrentTheme(){
    console.log("updating current theme...");
    if(document.body.classList.contains('vscode-dark')){
        document.documentElement.classList.add('dark');
    }else{
        document.documentElement.classList.remove('dark');
    }
}
export function initAndListenVsCode(initCommand:string, onResponse: (message: any) => void){
    updateCurrentTheme();
    window.addEventListener('message', (event:any)=> {
        const message = event.data ?? event.detail;
        if(!message || (event.isTrusted && !event.origin.startsWith('vscode'))) {
            console.log("not valid event", event);
            return;
        }
        console.log("received message from background", message);
        if(message.command === 'onDidChangeActiveColorTheme'){
            updateCurrentTheme();
        }else if(message.command === "message-response"){
            loader.active = false;
            loader.target = '';
            setMessage(message.message, message.success ? 'success' : 'danger');
            onResponse(message);
        }
    });
    postMessage({command: initCommand}, '');
}


export function triggerFakeEvent(){
    setTimeout(() => {
        const event = new CustomEvent('message', {
            detail: JSON.parse(`{
                "command": "message-response",
                "request": "initTranslationPage",
                "success": true,
                "message": "",
                "data": {
                    "settings":{
                        "baseTextSize": "1"
                    },
                    "map": [
                        {
                            "key": "add",
                            "value": [
                                "Neu",
                                "Add",
                                "Add es",
                                "Add fr",
                                "Add it",
                                "Nû",
                                "Ekle"
                            ]
                        },
                        {
                            "key": "add",
                            "value": [
                                "Neu",
                                "Add",
                                "Add es",
                                "Add fr",
                                "Add it",
                                "Nû",
                                "Ekle"
                            ]
                        },
                        {
                            "key": "add",
                            "value": [
                                "Neu",
                                "Add",
                                "Add es",
                                "Add fr",
                                "Add it",
                                "Nû",
                                "Ekle"
                            ]
                        },
                        {
                            "key": "add",
                            "value": [
                                "Neu",
                                "Add",
                                "Add es",
                                "Add fr",
                                "Add it",
                                "Nû",
                                "Ekle"
                            ]
                        },
                        {
                            "key": "add",
                            "value": [
                                "Neu",
                                "Add",
                                "Add es",
                                "Add fr",
                                "Add it",
                                "Nû",
                                "Ekle"
                            ]
                        },
                        {
                            "key": "add",
                            "value": [
                                "Neu",
                                "Add",
                                "Add es",
                                "Add fr",
                                "Add it",
                                "Nû",
                                "Ekle"
                            ]
                        },
                        {
                            "key": "add",
                            "value": [
                                "Neu",
                                "Add",
                                "Add es",
                                "Add fr",
                                "Add it",
                                "Nû",
                                "Ekle"
                            ]
                        },
                        {
                            "key": "add",
                            "value": [
                                "Neu",
                                "Add",
                                "Add es",
                                "Add fr",
                                "Add it",
                                "Nû",
                                "Ekle"
                            ]
                        },
                        {
                            "key": "add",
                            "value": [
                                "Neu",
                                "Add",
                                "Add es",
                                "Add fr",
                                "Add it",
                                "Nû",
                                "Ekle"
                            ]
                        },
                        {
                            "key": "add",
                            "value": [
                                "Neu",
                                "Add",
                                "Add es",
                                "Add fr",
                                "Add it",
                                "Nû",
                                "Ekle"
                            ]
                        },
                        {
                            "key": "add",
                            "value": [
                                "Neu",
                                "Add",
                                "Add es",
                                "Add fr",
                                "Add it",
                                "Nû",
                                "Ekle"
                            ]
                        },
                        {
                            "key": "add",
                            "value": [
                                "Neu",
                                "Add",
                                "Add es",
                                "Add fr",
                                "Add it",
                                "Nû",
                                "Ekle"
                            ]
                        },
                        {
                            "key": "add",
                            "value": [
                                "Neu",
                                "Add",
                                "Add es",
                                "Add fr",
                                "Add it",
                                "Nû",
                                "Ekle"
                            ]
                        },
                        {
                            "key": "add",
                            "value": [
                                "Neu",
                                "Add",
                                "Add es",
                                "Add fr",
                                "Add it",
                                "Nû",
                                "Ekle"
                            ]
                        },
                        {
                            "key": "add",
                            "value": [
                                "Neu",
                                "Add",
                                "Add es",
                                "Add fr",
                                "Add it",
                                "Nû",
                                "Ekle"
                            ]
                        },
                        {
                            "key": "add",
                            "value": [
                                "Neu",
                                "Add",
                                "Add es",
                                "Add fr",
                                "Add it",
                                "Nû",
                                "Ekle"
                            ]
                        },
                        {
                            "key": "close",
                            "value": [
                                "Schließen",
                                "Close",
                                "Close",
                                "Close",
                                "Close",
                                "Bigire",
                                "Kapat"
                            ]
                        },
                        {
                            "key": "color",
                            "value": [
                                "Farbe",
                                "Color",
                                "Color",
                                "Color",
                                "Color",
                                "Reng",
                                "Renk"
                            ]
                        },
                        {
                            "key": "dayNames",
                            "value": [
                                [
                                    "Montag",
                                    "Dienstag",
                                    "Mittwoch",
                                    "Donnerstag",
                                    "Freitag",
                                    "Samstag",
                                    "Sonntag"
                                ],
                                [
                                    "Monday",
                                    "Tuesday",
                                    "Wednesday",
                                    "Thursday",
                                    "Friday",
                                    "Saturday",
                                    "Sunday"
                                ],
                                [
                                    "Lunes",
                                    "Martes",
                                    "Miércoles",
                                    "Jueves",
                                    "Viernes",
                                    "Sábado",
                                    "Domingo"
                                ],
                                [
                                    "Monday",
                                    "Tuesday",
                                    "Wednesday",
                                    "Thursday",
                                    "Friday",
                                    "Saturday",
                                    "Sunday"
                                ],
                                [
                                    "Monday",
                                    "Tuesday",
                                    "Wednesday",
                                    "Thursday",
                                    "Friday",
                                    "Saturday",
                                    "Sunday"
                                ],
                                [
                                    "Duşem",
                                    "Sêşem",
                                    "Çarşem",
                                    "Pêncşem",
                                    "În",
                                    "Şemî",
                                    "Yekşem"
                                ],
                                [
                                    "Pazartesi",
                                    "Salı",
                                    "Çarşamba",
                                    "Perşembe",
                                    "Cuma",
                                    "Cumartesi",
                                    "Pazar"
                                ]
                            ]
                        },
                        {
                            "key": "description",
                            "value": [
                                "Bezeichnung",
                                "Description",
                                "Description",
                                "Description",
                                "Description",
                                "Danasîn",
                                "Açıklama"
                            ]
                        },
                        {
                            "key": "end",
                            "value": [
                                "Ende",
                                "End",
                                "End",
                                "End",
                                "End",
                                "Dawî",
                                "Bitiş"
                            ]
                        },
                        {
                            "key": "error",
                            "value": [
                                "Fehler",
                                "Error",
                                "Error",
                                "Error",
                                "Error",
                                "Xeta",
                                "Hata"
                            ]
                        },
                        {
                            "key": "event",
                            "value": [
                                "Event",
                                "event",
                                "event",
                                "event",
                                "event",
                                "çalakî",
                                "etkinlik"
                            ]
                        },
                        {
                            "key": "events",
                            "value": [
                                "Events",
                                "events",
                                "events",
                                "events",
                                "events",
                                "çalakî",
                                "etkinlik"
                            ]
                        },
                        {
                            "key": "from",
                            "value": [
                                "Von",
                                "From",
                                "From",
                                "From",
                                "From",
                                "Ji",
                                "Başlangıç"
                            ]
                        },
                        {
                            "key": "language",
                            "value": [
                                "Sprache",
                                "Language",
                                "Language",
                                "Language",
                                "Language",
                                "Ziman",
                                "Dil"
                            ]
                        },
                        {
                            "key": "monthNames",
                            "value": [
                                [
                                    "Januar",
                                    "Februar",
                                    "März",
                                    "April",
                                    "Mai",
                                    "Juni",
                                    "Juli",
                                    "August",
                                    "September",
                                    "Oktober",
                                    "November",
                                    "Dezember"
                                ],
                                [
                                    "January",
                                    "February",
                                    "March",
                                    "April",
                                    "May",
                                    "June",
                                    "July",
                                    "August",
                                    "September",
                                    "October",
                                    "November",
                                    "December"
                                ],
                                [
                                    "Enero",
                                    "Febrero",
                                    "Marzo",
                                    "Abril",
                                    "Mayo",
                                    "Junio",
                                    "Julio",
                                    "Agosto",
                                    "Septiembre",
                                    "Octubre",
                                    "Noviembre",
                                    "Diciembre"
                                ],
                                [
                                    "January",
                                    "February",
                                    "March",
                                    "April",
                                    "May",
                                    "June",
                                    "July",
                                    "August",
                                    "September",
                                    "October",
                                    "November",
                                    "December"
                                ],
                                [
                                    "January",
                                    "February",
                                    "March",
                                    "April",
                                    "May",
                                    "June",
                                    "July",
                                    "August",
                                    "September",
                                    "October",
                                    "November",
                                    "December"
                                ],
                                [
                                    "Rêbendan",
                                    "Sibat",
                                    "Adar",
                                    "Nîsan",
                                    "Gulan",
                                    "Hezîran",
                                    "Tîrmeh",
                                    "Tebax",
                                    "Îlon",
                                    "Cotmeh",
                                    "Mijdar",
                                    "Berfanbar"
                                ],
                                [
                                    "Ocak",
                                    "Şubat",
                                    "Mart",
                                    "Nisan",
                                    "Mayıs",
                                    "Haziran",
                                    "Temmuz",
                                    "Ağustos",
                                    "Eylül",
                                    "Ekim",
                                    "Kasım",
                                    "Aralık"
                                ]
                            ]
                        },
                        {
                            "key": "Opening Hours",
                            "value": [
                                "Öffnungszeiten",
                                "Opening Hours",
                                "",
                                "",
                                "",
                                "",
                                "Açılış Saatleri"
                            ]
                        },
                        {
                            "key": "saveChanges",
                            "value": [
                                "Speichern",
                                "Save Changes",
                                "Save Changes",
                                "Save Changes",
                                "Save Changes",
                                "Qeyd Bike",
                                "Kaydet"
                            ]
                        },
                        {
                            "key": "Send us a message",
                            "value": [
                                "Sende uns eine Nachricht",
                                "Send us a message",
                                "",
                                "",
                                "",
                                "Ji me re binivîsîne",
                                "Bize yaz"
                            ]
                        },
                        {
                            "key": "start",
                            "value": [
                                "Beginn",
                                "Start",
                                "Start",
                                "Start",
                                "Start",
                                "Destpêk",
                                "Başlangıç"
                            ]
                        },
                        {
                            "key": "title",
                            "value": [
                                "Name",
                                "Title",
                                "Title",
                                "Title",
                                "Title",
                                "Nav",
                                "Konu"
                            ]
                        },
                        {
                            "key": "to",
                            "value": [
                                "Bis",
                                "To",
                                "To",
                                "To",
                                "To",
                                "Heta",
                                "Bitiş"
                            ]
                        },
                        {
                            "key": "toCurrentMonth",
                            "value": [
                                "Zum aktuellen Monat",
                                "To current month",
                                "To current month",
                                "To current month",
                                "To current month",
                                "Biçe meha niha",
                                "Şimdiki aya git"
                            ]
                        }
                    ],
                    "configs": [
                        {
                            "key": "qusol",
                            "active": false,
                            "fileExts": "json",
                            "directory": "lang",
                            "regexFilter": "",
                            "recursive": false,
                            "fileNames": [],
                            "tableFilterEmpty": false,
                            "tableSaveOnChange": false,
                            "baseTextSize": "0.8"
                        },
                        {
                            "key": "New-1671314481691",
                            "active": true,
                            "fileExts": "json",
                            "directory": "c:/Workspace/node/VSCodeExt/arg-json-test/lang",
                            "regexFilter": "",
                            "recursive": false,
                            "fileNames": [
                                "de.json",
                                "en.json",
                                "es.json",
                                "fr.json",
                                "it.json",
                                "ku.json",
                                "tr.json"
                            ],
                            "tableFilterEmpty": false,
                            "tableSaveOnChange": false,
                            "baseTextSize": "0.8"
                        }
                    ]
                }
            }`)
        });

        // Dispatch the event.
        window.dispatchEvent(event);
    }, 1000);
}