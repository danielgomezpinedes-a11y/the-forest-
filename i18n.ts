
export type Language = 'es' | 'ca';

export const translations = {
  es: {
    mainMenu: {
      title: "THE FOREST",
      subtitle: "Sobrevive a la naturaleza salvaje",
      solo: "SOLO",
      multiplayer: "MULTIJUGADOR",
      tutorial: "TUTORIAL",
      language: "IDIOMA: ESPAÑOL"
    },
    loading: {
      title: "PREPARANDO LA MONTAÑA...",
      ready: "¡LISTO PARA LA AVENTURA!",
      start: "COMENZAR"
    },
    hud: {
      health: "SALUD",
      hunger: "HAMBRE",
      wood: "MADERA",
      stone: "PIEDRA",
      meat: "CARNE",
      fur: "PIEL",
      inventory: "INVENTARIO (I)",
      tutorial: "TUTORIAL (T)",
      weather: {
        CLEAR: "DESPEJADO",
        RAIN: "LLUVIA",
        FOG: "NIEBLA",
        SNOWSTORM: "TORMENTA DE NIEVE"
      }
    },
    inventory: {
      title: "INVENTARIO Y CRAFTEO",
      tabs: {
        items: "Mochila",
        crafting: "Fabricación"
      },
      resources: {
        meat: "Carne",
        fur: "Piel",
        wood: "Madera",
        stone: "Piedra"
      },
      items: {
        meat: "Carne",
        bandage: "Venda",
        coat: "Abrigo",
        stick: "Lanza",
        axe: "Hacha",
        pickaxe: "Pico",
        thermal: "Térmico",
        shelter: "Refugio",
        torch: "Antorcha",
        fire: "Fogata"
      },
      recipes: {
        bandage: "Cura heridas",
        coat: "Protección contra el frío",
        stick: "Arma básica",
        axe: "Tala árboles más rápido",
        pickaxe: "Pica piedra más rápido",
        thermal: "Protección extrema",
        shelter: "Lugar para descansar",
        torch: "Ilumina la noche",
        fire: "Calor y luz"
      }
    },
    tutorial: {
      title: "GUÍA DE SUPERVIVENCIA",
      steps: {
        movement: {
          title: "Movimiento",
          description: "Usa WASD para moverte por el bosque. Mantén SHIFT para correr. En móviles, usa el joystick izquierdo."
        },
        gathering: {
          title: "Recolección",
          description: "Acércate a troncos o piedras y haz CLICK IZQUIERDO para recolectarlos. También puedes usar la tecla E."
        },
        combat: {
          title: "Combate",
          description: "Los lobos y osos son peligrosos. Ataca con CLICK IZQUIERDO. Tener madera en el inventario te dará un palo para defenderte mejor."
        },
        survival: {
          title: "Supervivencia",
          description: "Vigila tu hambre y salud. Come carne recolectada de animales para recuperar energía. Si tienes frío, construye una fogata."
        },
        inventory: {
          title: "Inventario y Crafteo",
          description: "Pulsa I para abrir el inventario. Aquí puedes fabricar lanzas, abrigos y refugios con los materiales que recojas."
        },
        building: {
          title: "Construcción",
          description: "Una vez fabricados, usa B para colocar un refugio y F para una fogata. Te protegerán del frío y la noche."
        }
      },
      close: "ENTENDIDO"
    },
    death: {
      title: "HAS MUERTO",
      retry: "REINTENTAR"
    },
    tips: [
      "Caza animales para obtener carne y sobrevivir.",
      "El frío drena tu energía más rápido durante las tormentas.",
      "Busca refugio en las cuevas si el clima empeora.",
      "Comer carne recupera tanto hambre como salud.",
      "La cima de la montaña está a 10,000 metros de altura.",
      "Sigue el camino de piedra para un ascenso más seguro."
    ]
  },
  ca: {
    mainMenu: {
      title: "THE FOREST",
      subtitle: "Sobreviu a la natura salvatge",
      solo: "SOL",
      multiplayer: "MULTIJUGADOR",
      tutorial: "TUTORIAL",
      language: "IDIOMA: CATALÀ"
    },
    loading: {
      title: "PREPARANT LA MUNTANYA...",
      ready: "LLEST PER A L'AVENTURA!",
      start: "COMENÇAR"
    },
    hud: {
      health: "SALUT",
      hunger: "GANA",
      wood: "FUSTA",
      stone: "PEDRA",
      meat: "CARN",
      fur: "PELL",
      inventory: "INVENTARI (I)",
      tutorial: "TUTORIAL (T)",
      weather: {
        CLEAR: "ASSOLLELLAT",
        RAIN: "PLUJA",
        FOG: "BOIRA",
        SNOWSTORM: "TEMPESTA DE NEU"
      }
    },
    inventory: {
      title: "INVENTARI I CRAFTEIG",
      tabs: {
        items: "Motxilla",
        crafting: "Fabricació"
      },
      resources: {
        meat: "Carn",
        fur: "Pell",
        wood: "Fusta",
        stone: "Pedra"
      },
      items: {
        meat: "Carn",
        bandage: "Venda",
        coat: "Abric",
        stick: "Llança",
        axe: "Destral",
        pickaxe: "Pic",
        thermal: "Tèrmic",
        shelter: "Refugi",
        torch: "Torxa",
        fire: "Foguera"
      },
      recipes: {
        bandage: "Cura ferides",
        coat: "Protecció contra el fred",
        stick: "Arma bàsica",
        axe: "Tala arbres més ràpid",
        pickaxe: "Pica pedra més ràpid",
        thermal: "Protecció extrema",
        shelter: "Lloc per descansar",
        torch: "Il·lumina la nit",
        fire: "Calor i llum"
      }
    },
    tutorial: {
      title: "GUIA DE SUPERVIVÈNCIA",
      steps: {
        movement: {
          title: "Moviment",
          description: "Usa WASD per moure't pel bosc. Manté SHIFT per córrer. En mòbils, usa el joystick esquerre."
        },
        gathering: {
          title: "Recollida",
          description: "Acosta't a troncs o pedres i fes CLIC ESQUERRE per recollir-los. També pots usar la tecla E."
        },
        combat: {
          title: "Combat",
          description: "Els llops i óssos són perillosos. Ataca amb CLIC ESQUERRE. Tenir fusta a l'inventari et donarà un pal per defensar-te millor."
        },
        survival: {
          title: "Supervivència",
          description: "Vigila la teva gana i salut. Menja carn recollida d'animals per recuperar energia. Si tens fred, construeix una foguera."
        },
        inventory: {
          title: "Inventari i Crafteig",
          description: "Prem I per obrir l'inventari. Aquí pots fabricar llances, abrics i refugis amb els materials que recollís."
        },
        building: {
          title: "Construcció",
          description: "Un cop fabricats, usa B per col·locar un refugi i F per a una foguera. Et protegirà del fred i la nit."
        }
      },
      close: "ENTÈS"
    },
    death: {
      title: "HAS MORT",
      retry: "REINTENTAR"
    },
    tips: [
      "Caça animals per obtenir carn i sobreviure.",
      "El fred drena la teva energia més ràpid durant les tempestes.",
      "Busca refugi en les coves si el clima empitjora.",
      "Menjar carn recupera tant gana com salut.",
      "El cim de la muntanya està a 10.000 metres d'alçada.",
      "Segueix el camí de pedra per a un ascens més segur."
    ]
  }
};
