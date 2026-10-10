export type PetStatus = "available" | "pending" | "sold";

export interface Category {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Pet {
  id?: number;
  category?: Category;
  name: string;
  photoUrls: string[];
  tags?: Tag[];
  status?: PetStatus;
}

export interface ApiResponseMessage {
  code: number;
  type: string;
  message: string;
}
