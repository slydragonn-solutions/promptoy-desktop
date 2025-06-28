export interface TagColorScheme {
  bg: string;
  bgDark: string;
  text: string;
  textDark: string;
  border: string;
  borderDark: string;
  name: string;
}

export const TAG_COLORS: TagColorScheme[] = [
  {
    name: 'blue',
    bg: 'bg-blue-100',
    bgDark: 'dark:bg-blue-900',
    text: 'text-blue-800',
    textDark: 'dark:text-blue-300',
    border: 'border-blue-300',
    borderDark: 'dark:border-blue-700',
  },
  {
    name: 'green',
    bg: 'bg-green-100',
    bgDark: 'dark:bg-green-900',
    text: 'text-green-800',
    textDark: 'dark:text-green-300',
    border: 'border-green-300',
    borderDark: 'dark:border-green-700',
  },
  {
    name: 'yellow',
    bg: 'bg-yellow-100',
    bgDark: 'dark:bg-yellow-900',
    text: 'text-yellow-800',
    textDark: 'dark:text-yellow-300',
    border: 'border-yellow-300',
    borderDark: 'dark:border-yellow-700',
  },
  {
    name: 'red',
    bg: 'bg-red-100',
    bgDark: 'dark:bg-red-900',
    text: 'text-red-800',
    textDark: 'dark:text-red-300',
    border: 'border-red-300',
    borderDark: 'dark:border-red-700',
  },
  {
    name: 'purple',
    bg: 'bg-purple-100',
    bgDark: 'dark:bg-purple-900',
    text: 'text-purple-800',
    textDark: 'dark:text-purple-300',
    border: 'border-purple-300',
    borderDark: 'dark:border-purple-700',
  },
  {
    name: 'pink',
    bg: 'bg-pink-100',
    bgDark: 'dark:bg-pink-900',
    text: 'text-pink-800',
    textDark: 'dark:text-pink-300',
    border: 'border-pink-300',
    borderDark: 'dark:border-pink-700',
  },
  {
    name: 'indigo',
    bg: 'bg-indigo-100',
    bgDark: 'dark:bg-indigo-900',
    text: 'text-indigo-800',
    textDark: 'dark:text-indigo-300',
    border: 'border-indigo-300',
    borderDark: 'dark:border-indigo-700',
  },
  {
    name: 'teal',
    bg: 'bg-teal-100',
    bgDark: 'dark:bg-teal-900',
    text: 'text-teal-800',
    textDark: 'dark:text-teal-300',
    border: 'border-teal-300',
    borderDark: 'dark:border-teal-700',
  },
  {
    name: 'orange',
    bg: 'bg-orange-100',
    bgDark: 'dark:bg-orange-900',
    text: 'text-orange-800',
    textDark: 'dark:text-orange-300',
    border: 'border-orange-300',
    borderDark: 'dark:border-orange-700',
  },
  {
    name: 'cyan',
    bg: 'bg-cyan-100',
    bgDark: 'dark:bg-cyan-900',
    text: 'text-cyan-800',
    textDark: 'dark:text-cyan-300',
    border: 'border-cyan-300',
    borderDark: 'dark:border-cyan-700',
  },
];

// Function to get a random color scheme from the palette
export const getRandomTagColor = (): TagColorScheme => {
  const randomIndex = Math.floor(Math.random() * TAG_COLORS.length);
  return TAG_COLORS[randomIndex];
};

// Function to get color classes from a color scheme
export const getTagColorClasses = (color: TagColorScheme): string => {
  return [
    color.bg,
    color.bgDark,
    color.text,
    color.textDark,
    color.border,
    color.borderDark,
  ].join(' ');
};
