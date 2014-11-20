require 'nyny'
require 'sprockets'
require 'haml'
require 'coffee-script'

class CLI
  method_option :bump, default: "minor"
  method_option :firebase_url

  desc "run", "Start the worker"
  def run
    Event::Collection.on_child_added do |event|
      Runner.new(event).run
    end
  end
end
