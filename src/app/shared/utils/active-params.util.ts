import {ActiveParamsType} from "../../../types/active-params.type";
import {Params} from "@angular/router";

export class ActiveParamsUtil {
  static processParams(params: Params): ActiveParamsType{
    const activeParams: ActiveParamsType = {categories: []};

    if (params.hasOwnProperty('categories')) {
      activeParams.categories = Array.isArray(params['categories']) ? params['categories'] : [params['categories']]; //делаем массив в любом случае
    }

    if (params.hasOwnProperty('page')) {
      activeParams.page = +params['page']; //конвертируем в цифру
    }

    return activeParams;
  }
}
