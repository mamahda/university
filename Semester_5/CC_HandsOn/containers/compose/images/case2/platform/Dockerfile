FROM alpine:3.18


RUN apk update && apk add xvfb x11vnc openbox ttf-dejavu lxterminal firefox supervisor git bash


RUN git clone --depth 1 https://github.com/novnc/noVNC.git /opts/noVNC && \
    git clone --depth 1 https://github.com/novnc/websockify /opts/noVNC/utils/websockify && \
    rm -rf /opts/noVNC/.git && \
    rm -rf /opts/noVNC/utils/websockify/.git && \
    sed -i -- "s/ps -p/ps -o pid | grep/g" /opts/noVNC/utils/novnc_proxy


RUN rm -rf /tmp/* /var/cache/apk/*
RUN cd /opts/noVNC && cp vnc.html index.html
RUN mkdir -p /home/ && mkdir -p /etc/xdg/openbox



ADD certs/My* /tmp/
ADD start.sh /tmp
ADD supervisord.conf /tmp/supervisord.conf
ADD menu.xml /etc/xdg/openbox/menu.xml

RUN adduser user1 -D ; echo 'user1:user1qwerty' | chpasswd


EXPOSE 5910
EXPOSE 6666
EXPOSE 11111


ENTRYPOINT ["sh","-C","/tmp/start.sh"]
