
import { Question } from './types.ts';

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: '1',
    text: "Qu'est-ce qu'une attaque de phishing (hameçonnage) ?",
    options: [
      "Une technique pour ralentir un ordinateur",
      "Une tentative frauduleuse de voler des informations sensibles",
      "Un logiciel antivirus gratuit",
      "Une méthode de cryptage de disque"
    ],
    correctAnswer: 1,
    explanation: "Le phishing consiste à se faire passer pour une entité de confiance afin de voler des identifiants ou des données bancaires.",
    difficulty: 'easy',
    hint: "Pensez à un 'appât' utilisé par un pêcheur pour attraper un poisson."
  },
  {
    id: '2',
    text: "Lequel de ces mots de passe est le plus sécurisé ?",
    options: [
      "123456",
      "MonChat123!",
      "k9#pL2!zR8w$Q",
      "adminadmin"
    ],
    correctAnswer: 2,
    explanation: "Un mot de passe complexe avec des majuscules, minuscules, chiffres et caractères spéciaux aléatoires est plus robuste.",
    difficulty: 'easy',
    hint: "L'imprévisibilité et la variété des caractères sont les clés d'un bon coffre-fort."
  },
  {
    id: '3',
    text: "Que signifie le 'S' dans HTTPS ?",
    options: [
      "System",
      "Secure",
      "Secret",
      "Server"
    ],
    correctAnswer: 1,
    explanation: "Le S signifie Secure, indiquant que la connexion entre le navigateur et le serveur est chiffrée.",
    difficulty: 'easy',
    hint: "C'est l'opposé de 'vulnérable' ou 'exposé'."
  },
  {
    id: '4',
    text: "Qu'est-ce qu'un ransomware (rançongiciel) ?",
    options: [
      "Un virus qui supprime tous vos fichiers",
      "Un logiciel qui bloque l'accès aux données contre une rançon",
      "Un outil de récupération de mot de passe",
      "Un programme qui espionne votre webcam"
    ],
    correctAnswer: 1,
    explanation: "Le ransomware chiffre vos fichiers et exige un paiement pour fournir la clé de déchiffrement.",
    difficulty: 'medium',
    hint: "C'est une prise d'otage numérique de vos fichiers personnels."
  },
  {
    id: '5',
    text: "Quelle est la principale fonction d'un pare-feu (firewall) ?",
    options: [
      "Refroidir le processeur",
      "Nettoyer le registre système",
      "Surveiller et contrôler le trafic réseau entrant/sortant",
      "Augmenter la vitesse de connexion internet"
    ],
    correctAnswer: 2,
    explanation: "Le pare-feu agit comme un filtre entre votre réseau interne et le monde extérieur.",
    difficulty: 'medium',
    hint: "Imaginez un garde de sécurité à l'entrée d'un bâtiment qui vérifie les badges."
  },
  {
    id: '6',
    text: "Quel principe de sécurité stipule qu'une entité ne doit avoir que les accès strictement nécessaires à ses fonctions ?",
    options: [
      "La Défense en Profondeur",
      "Le Moindre Privilège",
      "Le Zero Trust Architecture",
      "Le Chiffrement de Bout en Bout"
    ],
    correctAnswer: 1,
    explanation: "Le principe du moindre privilège limite les droits d'accès au minimum requis, réduisant ainsi la surface d'attaque en cas de compromission.",
    difficulty: 'hard',
    hint: "Pensez à ne donner que la clé de la boîte aux lettres au facteur, pas celle de la maison."
  },
  {
    id: '7',
    text: "Dans une attaque par injection SQL, quelle séquence est souvent utilisée pour bypasser une authentification ?",
    options: [
      "<script>alert(1)</script>",
      "' OR '1'='1' --",
      "chmod 777 /etc/shadow",
      "nc -lvp 4444 -e /bin/bash"
    ],
    correctAnswer: 1,
    explanation: "L'expression '1'='1' est toujours vraie. Combinée avec OR et un commentaire (--), elle permet souvent de forcer une connexion sans mot de passe valide.",
    difficulty: 'hard',
    hint: "Il s'agit d'une tautologie logique injectée dans une requête de base de données."
  },
  {
    id: '8',
    text: "Quel algorithme de chiffrement est considéré comme asymétrique ?",
    options: [
      "AES-256",
      "RSA",
      "ChaCha20",
      "Blowfish"
    ],
    correctAnswer: 1,
    explanation: "RSA utilise une paire de clés (publique et privée), contrairement aux autres qui sont des algorithmes symétriques utilisant la même clé pour chiffrer et déchiffrer.",
    difficulty: 'hard',
    hint: "Il porte le nom de ses inventeurs Rivest, Shamir et Adleman."
  }
];

export const APP_NAME = "CyberShield AI";
