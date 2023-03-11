import os
import sys
import shutil

def main():
  broowzer_extension_dir = os.path.realpath(os.path.dirname(
      os.path.dirname(os.path.realpath(__file__))))
  broowzer_extension_browser_resources_dir = os.path.join(broowzer_extension_dir, 'app')
  locales_src_dir_path = broowzer_extension_browser_resources_dir;
  broowzer_out_dir = sys.argv[1]
  locales_dest_dir_path = os.path.join(broowzer_out_dir, 'broowzer_extension')
  copy_locales(locales_src_dir_path, locales_dest_dir_path)

def copy_locales(locales_src_dir_path, locales_dest_dir_path):
  try:
    locales_dest_path = os.path.join(locales_dest_dir_path, '_locales')
    shutil.rmtree(locales_dest_path)
  except:
    pass
  shutil.copytree(os.path.join(locales_src_dir_path, '_locales'), locales_dest_path)

if __name__ == '__main__':
  sys.exit(main())
