import { SearchTypes, DocumentFormats } from "./models/search-type.enum";
import { BoaResource } from './models/boa-resource.interface';

export const getItemTypeLabel = (itemType: string, plural?: boolean) => {
  switch (itemType) {
    case SearchTypes.image:
      return plural ? 'Imagenes' : 'Imagen';

    case SearchTypes.video:
      return plural ? 'Videos' : 'Video';
    
    case SearchTypes.audio:
      return plural ? 'Audios' : 'Audio';
      
    case SearchTypes.document:
      return plural ? 'Documentos' : 'Documento';
      
    case SearchTypes.didacticUnit:
      return plural ? 'Unidades didacticas' : 'Unidad didáctica';

    default:
      return 'Undefined';
  }
};

export const getItemTypeIcon = (itemType: string) => {
  switch (itemType) {
    case SearchTypes.image:
      return 'image';

    case SearchTypes.video:
      return 'videocam';
    
    case SearchTypes.audio:
      return 'volume-medium';
    
    case SearchTypes.document:
      return 'document';
    
    case SearchTypes.didacticUnit:
      return 'people';

    default:
      return 'cube';
  }
}

export const getSizeLabel = (alternate: string) => {
  if (alternate === 'original') {
    return 'Original';
  } else {
    const size = alternate.split('.')[0];
    switch (size) {
      case 'medium':
        return 'Mediano';

      case 'small':
        return 'Pequeño';

      case 'thumb':
        return 'Miniatura';

      case 'high':
        return 'HD';

      case 'preview':
        return 'Vista previa';

      default:
        return alternate;
    }
  }
};

export const getResourceType = (resource: BoaResource): string => {
  if (DocumentFormats.includes(resource.metadata.technical.format)) {
    return 'document';
  } else {
    return resource.metadata.technical.format.split('/')[0]
  }
}
