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
        iterator = 0
        alternator = 'T'
        pd = line.split(',')
        player['last'] = pd[0].strip()
        player['first'] = pd[1].strip()
        winningTeams = {}
        teamName = ''
        for i in itertools.islice(pd, 2, len(pd) - 1):
            if alternator == 'T':
                alternator = 'Y'
                teamName = i.strip()
            else:
                year = i.strip()
                year = year.decode('unicode_escape').encode('ascii', 'replace')
                splitter = ''
                if('-' in year):
                    splitter = '-'
                elif('???' in year):
                    splitter = '???'
                if(splitter is not ''):
                    years = year.split(splitter)
                    prefix = years[0][:2]
                    for index, val in enumerate(years[0:]):
                        if(len(val)<4):
                            years[index] = prefix+str(val)
                    for year in years:
                        winningTeams[year] = teamName
                else:
                    winningTeams[year] = teamName
                iterator += 1
                alternator = 'T'
        player['wins'] = winningTeams
        player['winCount'] = pd[len(pd) - 1].strip().replace('{','').replace('}', '')
        player['id'] = len(data)
        data.extend([player])
