add_rules("mode.debug", "mode.release")

target("mini_lisp")
  add_files("src/*.cpp")
  set_languages("c++20")
  set_targetdir("bin")
  if is_plat("msvc") then
    add_cxflags("/utf-8")
  end
