# assuming files.txt has a path to a file one on each line

filenames = []

File.open("find.txt").each_line do |filename|
  filenames << filename
end

HOW_MANY_FILES_IN_A_COMMIT = 1000
counter = 1

while filenames.length > 0
  puts "Preparing commit \##{counter}..."

  filenames_for_this_commit = []

  HOW_MANY_FILES_IN_A_COMMIT.times do
    filename_to_add = filenames.delete_at(0)
    `git add #{filename_to_add}`
  end

  puts "Making the commit."
  `git commit -m "files #{counter}-#{counter+HOW_MANY_FILES_IN_A_COMMIT}"`
  # if it were me i would probably push each commit as i made it... but maybe there's a reason not to?
  # you could comment/uncomment this next line accordingly
  `git push origin master`

  counter += 1

  puts ""
end

puts "Done! Whew!"