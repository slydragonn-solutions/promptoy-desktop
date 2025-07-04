export interface TagColorScheme {
    bg: string;
    bgDark: string;
    text: string;
    textDark: string;
    border: string;
    borderDark: string;
    name: string;
}

export interface Tag {
  id: string;
  name: string;
  color: TagColorScheme;
  createdAt: string;
  updatedAt: string;
}