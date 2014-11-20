module Hawkins
  class << self
    def concurrent_builds
      4
    end

    def build_timeout
      2.hours
    end

    def firebase_uri
    end

    def build_path
    end
  end

  class Application
    set :queue, Queue.new
    set :runner, Runner.new(config.queue)

    post "/api/repositories/:repository_id/builds" do
      Repository::Collection.find(params[:repository_id]).build(params[:branch])
    end
  end

  class Repository
    def initialize(name, url)
      @name, @url = name, url
    end
  end

  module Collection
    class Base
      class_attribute :name

      def push(attrs)
        database.push(self.class.name, attrs)
      end

      private

      def on_child_added(&block)
        reference.on(:child_added, &block)
      end

      def reference
        firebase.child(self.class.name)
      end

      def firebase
        @firebase ||= RestFirebase.new(Hawkins.firebase_uri)
      end
    end
  end

  class Event
    class Collection < Collection::Base
      self.name = "events"
    end
  end

  class Build
    class Collection < Collection::Base
      self.name = "builds"

      def start(build, pid)
      end

      def log(line)
      end

      def finish(build, status)
      end
    end

    def initialize(project, branch)
      @project, @branch = project, branch
    end
  end

  require 'pty'

  class Runner
    def initialize(build)
      @build = build
    end

    def run
      clone
      status = spawn do |stdout, stdin, pid|
        Build::Collection.start(build, pid)
        stdout.each { |line| Build::Collection.log(build, line) }
      end
      Build::Collection.finish(build, status: status)
    end

    def path
      File.join(Hawkins.build_path, build.repository.name, build.branch, Time.now.to_i)
    end

    private

    def default_env_vars
      {HAWKINS_REPOSITORY: build.repository.name, HAWKINS_BRANCH: build.branch, HAWKINS_REVISION: revision, HAWKINS_BUILD_PATH: path}
    end

    def clone
      system "git", "clone", build.repository.url, path
    end

    def kill
    end

    def spawn
      PTY.spawn(File.join(path, "Hawkfile")) do |stdout, stdin, pid|
        yield(stdout, stdin, pid)
        Process.wait(pid)
      end
    rescue PTY::ChildExited => e
      e.status.exitstatus
    end
  end
end
