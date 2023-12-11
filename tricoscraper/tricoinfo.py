"""Information necessary for the trico.haverford.edu scraper

Written by Kei Imada

Last modified 20180815

"""


import bs4
import certifi
import urllib3 as urllib
from tricoglobals import TRICO_URL
import re

class TricoInfo(object):
    """Information necessary for the scraper

    Attributes:
        semesters (list of strings): all possible semesters
        campuses (list of strings): all possible campuses
        departments (list of strings): all possible departments
        meetdays (list of strings): all possible meetdays
        meettimes (list of strings): all possible meettimes

    """
    def __init__(self, trico_url=TRICO_URL, ssl=True):
        if ssl:
            http = urllib.PoolManager(cert_reqs='CERT_REQUIRED',
                                      ca_certs=certifi.where())
        else:
            http = urllib.PoolManager()
        self._req = http.request('GET', trico_url)
        self._soup = bs4.BeautifulSoup(self._req.data, 'html.parser')
        # semesters
        #The names are i.e. semester[fall_2019], ...
        self.semesters = [e['value'] for e in
                          (self._soup.find_all('input',
                                               {'name': re.compile("^semester")}))]
        # campuses
        #The names are i.e. college[swarthmore], ...
        self.campuses = [e['value'] for e in
                         (self._soup.find_all('input',
                                              {'name': re.compile("^college")}))]
        # departments
        dept_select_element = self._soup.find('select',
                                              {'name': 'department[]'})
        self.departments = [e['value'] for e in
                            dept_select_element.findChildren('option')]
        # meetdays
        meetday_select_element = self._soup.find('select',
                                                 {'name': 'days[]'})
        self.meetdays = [e['value'] for e in
                         meetday_select_element.findChildren('option')]
        # meettimes
        meettime_select_element = self._soup.find('select',
                                                  {'name': 'start_times[]'})
        self.meettimes = [e['value'] for e in
                          meettime_select_element.findChildren('option')]


def main():
    ti = TricoInfo()
    print(ti.semesters)
    print(ti.campuses)
    print(ti.departments)
    print(ti.meetdays)
    print(ti.meettimes)


if __name__ == '__main__':
    main()
