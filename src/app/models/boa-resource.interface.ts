export interface BoaRepository {
  name: string;
  api: string;
  version: number;
  catalogs: BoaCatalog[];
}

export interface BoaCatalog {
  key: string;
  title: string;
  access: string;
  available: boolean;
}

export interface BoaResource {
  catalog_id: string;
  manifest: BoaResourceManifest;
  metadata: BoaResourceMetadata;
  social: BoaResourceSocial;
  id: string;
  about: string;
  type?: string;
  repositoryName?: string;
}

export interface BoaResourceManifest {
  title: string;
  type: string;
  is_a: string;
  lastpublished: string;
  alternate: string[];
  customicon: string;
  entrypoint?: string;
  conexion_type?: string;
  author?: string;
  url?: string;
  version?: number;
}

export interface BoaResourceMetadata {
  general: {
    title: {
      none: string;
    };
    identifier?: any[];
    language?: string[];
    description: {
      none: string;
    };
    keywords?: {
      none: string[];
    };
  };
  lifecycle?: {
    contribution: Contribution[];
  };
  technical: {
    format: string;
    location: string;
  };
  rights?: {
    cost: string;
    copyright: string;
    description: {
      none: string;
    };
  };
  annotation?: any[];
}

export interface Contribution {
  entity: {
    name: string;
    lastname: string;
    company: string;
    email: string;
  };
  rol: string;
  date: string;
}

export interface BoaResourceSocial {
  views: number;
  score: any[];
  comments: number;
}
