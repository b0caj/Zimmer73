export const initialBoard = {
  title: "Allgemeinwissen",
  categories: [
    {
      name: "GEOGRAPHIE",
      questions: [
        { points: 100, text: "Was ist die Hauptstadt von Frankreich?", answer: "Paris", mediaType: "none", mediaUrl: "" },
        { points: 200, text: "Welcher Fluss fließt durch Ägypten?", answer: "Der Nil", mediaType: "none", mediaUrl: "" }
      ]
    },
    {
      name: "WISSENSCHAFT",
      questions: [
        { points: 100, text: "Welches Gas einatmen Menschen zum Überleben?", answer: "Sauerstoff (O2)", mediaType: "none", mediaUrl: "" },
        { points: 200, text: "Wie viele Planeten hat unser Sonnensystem?", answer: "8", mediaType: "none", mediaUrl: "" }
      ]
    },
    {
      name: "SPORT",
      questions: [
        { points: 100, text: "Wie viele Spieler stehen beim Fußball pro Team auf dem Platz?", answer: "11", mediaType: "none", mediaUrl: "" },
        { points: 200, text: "Welcher Tennisspieler hält den Rekord für die meisten Grand-Slam-Titel bei den Herren?", answer: "Novak Djokovic", mediaType: "none", mediaUrl: "" }
      ]
    }
  ]
};