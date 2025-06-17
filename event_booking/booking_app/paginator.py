from django.core.paginator import Paginator


def paginator_func(request, object_list):

    number_of_items = int(request.get('page_size')) or 10
    paginator = Paginator(object_list, number_of_items)
    page_obj = paginator.get_page(request.get('page') or 1)

    return page_obj, paginator.count