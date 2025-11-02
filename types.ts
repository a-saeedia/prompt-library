
export type Language = 'en' | 'fa';

export type Prompt = {
  id: string;
  title_en: string;
  title_fa: string;
  category: string;
  industry: string;
  role: string;
  prompt_en: string;
  prompt_fa: string;
  tags_en: string[];
  tags_fa: string[];
};

export type Translations = {
  [key: string]: {
      [key: string]: string;
  };
};
