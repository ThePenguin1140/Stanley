import itertools
import json

def parse_to_json(csv, outFile):
    df = []
    parse(csv, df)
    with open(outFile, "w+") as out:
        out.write(json.dumps(df, indent=4))
    return df


def parse(fn, df):
    with open(fn) as f:
        content = f.readlines()

    parser(content, df)


def parser(content, data):
    for line in content:
        player = {}
        alternator = 'T'
        pd = line.split(',')
        player['name'] = pd[1].strip() + ' ' + pd[0].strip()
        winningTeams = {}
        teamName = ''
        for i in itertools.islice(pd, 2, len(pd) - 1):
            if alternator == 'T':
                alternator = 'Y'
                teamName = i.strip()
            else:
                year = i.strip()
                year = year.decode('unicode_escape').encode('ascii', 'replace')
                while('???' in year or '-' in year):
                    years = parseYears(year)
                    year = ''
                    prefix = years[0][:2]
                    for index, val in enumerate(years[0:]):
                        if('???' in val or '-' in val):
                            year = val
                            continue
                        if(len(val)<4):
                            val = prefix+str(val)
                        winningTeams[val] = teamName
                alternator = 'T'
        player['wins'] = winningTeams
        player['winCount'] = pd[len(pd) - 1].strip().replace('{','').replace('}', '')
        data.extend([player])

def parseYears(year):
    output = []
    splitter = ''
    if('-' in year):
        splitter = '-'
    elif('???' in year):
        splitter = '???'
    if(splitter is not ''):
        output = year.split(splitter)
    return output