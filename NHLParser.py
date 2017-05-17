import itertools
import json

PLAYER_GROUP = 2
TEAM_GROUP = 1

def splitTeamByYears(nodes):
    nodesCpy = []
    for index, value in enumerate(nodes):
        if(value['group'] is TEAM_GROUP):
            for year, players in value['wins'].iteritems():
                nodesCpy.append({
                    'id': len(nodesCpy),
                    'name': value['name'],
                    'roster': players,
                    'year': year,
                    'group': value['group']
                })
    nodesCpy.sort(key=lambda x: int(x['year']))
    return nodesCpy

def buildArcLinks(nodes):
    links = []
    players = {}
    for index, value in enumerate(nodes):
        if(value['group'] is TEAM_GROUP):
            value['id'] = index;
            for player in value['roster']:
                if(player not in players.keys()):
                    players[player] = value['id']
                elif(index > players[player]):
                    links.append({
                        'source': players[player],
                        'target': value['id'],
                        'player': player,
                    })
                    players[player] = value['id']
    return links


def buildTeamRosters(nodes):
    winningYears = {}
    for index, value in enumerate(nodes):
        if(value['group'] is PLAYER_GROUP):
            #add player to each roster
            for year, team in value['wins'].iteritems():
                if(year+team not in winningYears.keys()):
                    winningYears[year+team] = [value['id']]
                else:
                    winningYears[year+team].extend([value['id']])


    for index, value in enumerate(nodes):
        if(value['group'] is TEAM_GROUP):
            #collect the winning years
            teamYears = {}
            for year, roster in value['wins'].iteritems():
                nodes[index]['wins'][year] = winningYears[year+value['name']]

    return nodes

def buildLinks(nodes):
    output = []
    for index, value in enumerate(nodes):
        if(value['group'] is TEAM_GROUP):
            for year, roster in value['wins'].iteritems():
                for player in roster:
                    link = {
                        'target': player,
                        'source': index,
                        'value': year
                    }
                    output.append(link)

    return output

def buildTeamNodes(data):
    nodes = []
    teams = {}
    for playerData in data:
        for year, team in playerData['wins'].iteritems():
            if( team not in teams.keys() ):
                teams[team] = {
                    'wins': {
                        year: []
                    },
                    'winCount': 1,
                    'name': team,
                    'group': TEAM_GROUP
                }
            else:
                if( year not in teams[team]['wins'] ):
                    #add year to wins
                    teams[team]['wins'][year] = []
                    teams[team]['winCount'] = teams[team]['winCount'] + 1

    for key, value in teams.iteritems():
        nodes.append(value)

    nodes.extend(data)

    return nodes

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
    playerCount = 0
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
                if( '???' not in year and '-' not in year):
                    winningTeams[year] = teamName
                if '???' in year or '-' in year :
                    years = parseYears(year)
                    prefix = ''
                    y2=[]
                    for y in years:
                        if( len(y) == 4 ):
                            prefix = y[:2]
                        if( len(y) == 2 and prefix != '' ):
                            y = str( int(prefix)*100 + int(y) )
                        y2.append(y)
                        winningTeams[y] = teamName
                    print player['name']
                    print y2
                alternator = 'T'
        player['wins'] = winningTeams
        player['winCount'] = pd[len(pd) - 1].strip().replace('{','').replace('}', '')
        player['group'] = PLAYER_GROUP
        player['id'] = playerCount
        playerCount+=1
        data.extend([player])

def parseYears(year):
    cleanerList = []
    splitter = ''
    if('-' in year):
        splitter = '-'
    elif('???' in year):
        splitter = '???'
    if(splitter is not ''):
        cleanerList= year.split(splitter)

    clean = False
    while( not clean and splitter is not ''):
        output = []
        clean = True
        for o in cleanerList:
            if( '-' in o ):
                clean = False
                y = o.split( '-' )
            elif( '???' in o ):
                clean = False
                y = o.split( '???' )
            else:
                y = [o]
            output.extend(y)
        cleanerList = output
    return output
