"""Diff old and new classes for display/email
"""


import json

def format_time(t):
    return t.replace("&nbsp;", " ").replace("<wbr>", "")

def print_class(c):
    print("{}: {} ({})".format(c['name'], c['c_title'], c['ref']))
    print("    Instruct: {} on {} {}".format(c['instruct'], c['days'], format_time(c['time'])))

def print_diff_class(pair):
    old_list = list(pair[0][1])
    new_list = list(pair[1][1])
    for o in old_list[:]:
        for n in new_list[:]:
            if o[0] == n[0]:
                if o[1] != n[1]:
                    print("    {}: {} -> {}".format(o[0], o[1], n[1]))
                old_list.remove(o)
                new_list.remove(n)
                break
    for i in old_list:
        print("    -{}: {}".format(i[0], i[1]))
    for i in new_list:
        print("    +{}: {}".format(i[0], i[1]))

def diff_classses(old_arr, new_arr):
    # TODO not worrying about the 3 dicts (usual, noTime, multiTime)
    old_cls = old_arr[0]
    new_cls = new_arr[0]

    for d in old_cls:
        del old_cls[d]['URL']
    for d in new_cls:
        del new_cls[d]['URL']

    # https://stackoverflow.com/questions/11941817/how-to-avoid-runtimeerror-dictionary-changed-size-during-iteration-error
    for o in list(old_cls):
        for n in list(new_cls):
            if old_cls[o] == new_cls[n]:
                # Have the same thing in the old as new, remove from new_cls
                del old_cls[o];
                del new_cls[n];
                break;
    
    # Now dicts have only classes which are different between old/new
    old_set = [[a, set(old_cls[a].items())] for a in old_cls]
    new_set = [[a, set(new_cls[a].items())] for a in new_cls]

    old_new_pair = []

    for o in old_set[:]:
        for n in new_set[:]:
            #If less than 3 changes between the sets, consider equal
            if len(o[1]-n[1]) <=6:
                old_new_pair.append([o, n])

                old_set.remove(o)
                new_set.remove(n)
                break;

    print("=== Removed Classes:")
    for i in old_set:
        print_class(old_cls[i[0]])
    print("=== New Classes:")
    for i in new_set:
        print_class(new_cls[i[0]])

    print("=== Modified Classes:")
    for i in old_new_pair:
        print_class(new_cls[i[1][0]])
        print_diff_class(i)



    


def main():
    old_class_arr = json.load(open('trico_scraped.json.tmp'))
    new_class_arr = json.load(open('trico_scraped.json'))

    diff_classses(old_class_arr, new_class_arr)

if __name__ == '__main__':
    main()
