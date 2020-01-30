from git import Repo

repo = Repo()
origin = repo.remote(name='origin')

cnt = 0
total = 0
for fp in repo.untracked_files:
    repo.index.add([fp])
    if (cnt > 500):
        print(cnt, " + ", total)
        repo.index.commit("archive commit #"+str(total))
        origin.push()
        cnt = 0
    cnt += 1
    total += 1


#filepath = 'find.txt'
#with open(filepath) as fp:
#    line = fp.readline()
#    cnt = 1
#    total = 1
#   while line:
#        if cnt > 1000:
#            print("Line {}: {}".format(total, line.strip()))
#            cnt = 0
            # subprocess.run("", check=True, shell=True)
#        line = fp.readline()
#        cnt += 1
#        total += 1