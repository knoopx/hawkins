FROM phusion/passenger-ruby21

ENV HOME /root
CMD ["/sbin/my_init"]

RUN rm -f /etc/service/redis/down
RUN rm -f /etc/service/memcached/down

RUN su app -c 'mkdir /home/app/{bundle,bundle-cache,webapp}'

WORKDIR /home/app/webapp

#ONBUILD COPY vendor/cache /home/app/bundle-cache/vendor/cache
#ONBUILD COPY Gemfile /home/app/bundle-cache/Gemfile
#ONBUILD COPY Gemfile.lock /home/app/bundle-cache/Gemfile.lock
#ONBUILD RUN chown -R app /home/app/bundle-cache
#ONBUILD RUN su app -c 'RAILS_ENV=production bundle exec rake assets:precompile'
ONBUILD RUN su app -c 'cd /home/app/bundle-cache && bundle install --jobs=4 --path=/home/app/bundle --no-cache'
ONBUILD COPY / /home/app/webapp
ONBUILD RUN mkdir -p log tmp public && chown --recursive app log tmp public
