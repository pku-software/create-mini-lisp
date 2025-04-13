add_rules("mode.debug", "mode.release")

target("mini_lisp")
  add_files("src/*.cpp")
  set_languages("c++20")
  set_targetdir("bin")
  set_encodings("utf-8")
