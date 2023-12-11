"""Global variables for scheduler scraper

Written by Kei Imada

Last modified on 20180815

Attributes:
    TRICO_URL (string): url for trico.haverford.edu homepage
    TRICO_PREFIX (string): url stub for getting course descriptions

"""


TRICO_URL = ("https://www.swarthmore.edu/tricollege-course-guide/search-results")

TRICO_PREFIX = ("https://www.swarthmore.edu")


def main():
    print('this file contains global variables for the scheduler scraper')


if __name__ == '__main__':
    main()
