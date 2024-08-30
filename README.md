This tool will allow you to create a task list more easily based on a project.

# Features
- Choose a main task as the end of a project
- Inherit parameters from parent to child tasks
- Create project branches called "Racks"
- The parent task will depend on all child tasks
- Child tasks depend on each other to perform step-by-step tasks for each Rack
- Override parameters of child tasks for each Rack
- Use a single file as a readable task list

# Requirements
- Have Bun installed
- Obviously, have TaskWarrior

# Usage
- Clone this repository
- Create a text file that complies with the format found in #Task List Format Guide
- bun run task_list.js --file /your/task/list

# Task List Format Guide
You should create a text file wherever you want, and this text file must follow this format:
- Title: Title of the main task
- Task Warrior format parameters: Parameters of the main task (and those that will be inherited by its children). It is mandatory to include at least the project parameter. Example of parameters: project:big_project due:3d
- Rack: The rack must start with a dot, for example, ".my_branch". This will make the child tasks' project of this rack "big_project.my_branch" if your parent project is "big_project". If you want the children of this rack to have different parameters than the parent, you must write them next to your rack. For example, if you want this rack to have a different `due` than the parent, just write it like this: `.my_branch due:1d`
- Tasks: Just write the title of the tasks (these do not accept parameters; you should only write the title). Keep in mind that the tasks will depend on the task written previously.

Here is an example of how your file should look:

```
Create a new song
project:music.new_song due:1month tag:funny

.materials due:2d tag:
Repair the guitar because it broke
Buy new strings
Find my draft notebook that I had lost

.
Choose a theme for my song
Write the lyrics
Compose the melody
Compose the harmony with my guitar
Record the song
Edit the song
Draw a quick cover art

.marketing
Publish the song under Creative Commons
```

This example has a title that represents the subjective end of the task.
Then, we set the parameters that all child tasks will inherit, meaning they will all share the same tag, due, and others unless we decide to overwrite them.
This file has 3 racks:
.materials, ., .marketing

.materials is something we need to do soon and it's not fun, so we set the due date to two days and leave the tag empty.

. The dot with nothing in front means that the child tasks of this rack will have the parent project, which is `music.new_song`.

.marketing
Only has one task and inherits everything from the parent.

I want to clarify that each task will depend on the previous one within its rack. For example, in the second rack, "Draw a quick cover art" will depend on "Edit the song" being completed first, which in turn will depend on "Record the song," which will depend on "Compose the harmony with the guitar," which will depend on "Compose the melody," which will depend on "Write the lyrics." Since this task is at the top of the rack, it doesn't depend on anything. Additionally, the parent task depends on all child tasks being completed.


# Recommendations:
- The main task should be the last step of your project or the step that indicates the end of a stage. For example, if you are making a song, it could be "Publish Song on Spotify."
- You should use this tool only if you want a "step-by-step" workflow for your tasks.


# Author
kelvinauta.com
Donate: ko-fi.com/kelvinauta